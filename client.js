async function pullWeather(date_string, lat, lon) {
/*   const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,cloud_cover&forecast_days=16`; */
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max,sunset,sunrise,moon_phase,temperature_2m_max,temperature_2m_min&hourly=direct_normal_irradiance,temperature_2m,apparent_temperature,precipitation_probability,cloud_cover,uv_index&current=uv_index,temperature_2m,apparent_temperature,direct_normal_irradiance,cloud_cover,precipitation&timezone=auto&forecast_days=16`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    //find the index of the current time
    var time_index = 0;
    for (const [index, item] of result.hourly.time.entries()) {
      if (date_string == item) {
        time_index = index;
      }
    }

    console.debug(time_index);

    //now variables
    const time_now = result.current.time.slice(11, 16) + " " + result.current.time.slice(8, 10) + "." + result.current.time.slice(5, 7) + "." + result.current.time.slice(0, 4)
    const temp_now = result.current.temperature_2m + " C°"
    const temp_felt_now = result.current.apparent_temperature + " C°"
    const direct_normal_irradiance = result.current.direct_normal_irradiance + " W/m²"
    const uv_index_now = result.current.uv_index

    //today variables
    const max_temp_today = result.daily.temperature_2m_max[0] + " C°"
    const min_temp_today = result.daily.temperature_2m_min[0] + " C°"
    const sunset_today = result.daily.sunset[0].slice(11, 16)
    const moon_phase_today = result.daily.moon_phase[0]


    //tomorrow variables
    const max_temp_tomorrow = result.daily.temperature_2m_max[1] + " C°"
    const max_uv_index_tomorrow = result.daily.uv_index_max[1]


    //future variables
    const array_of_DNIs = result.hourly.direct_normal_irradiance
    var next_time_DNI_over_120 = -1

    
      //determine the index of the next time that the cloud cover ist less than p
      //then determine if that timeframe is between sunrise and sunset
    for(let i = time_index; i < array_of_DNIs.length; i++){

      if (array_of_DNIs[i] > 120) {

        const just_date = result.hourly.time[i].slice(0, 10)
        let date_index;
        for (const [index, item] of result.daily.time.entries()){
          if(just_date == item){
            date_index = index
          }
        }
        
        const sunrise = new Date(result.daily.sunrise[date_index])
        const sunset  = new Date(result.daily.sunset[date_index])
        const time = new Date(result.hourly.time[i]);

        if (sunrise < time && time < sunset){
          next_time_DNI_over_120 = result.hourly.time[i].slice(11, 16) + " " + result.hourly.time[i].slice(8, 10) + "." + result.hourly.time[i].slice(5, 7) + "." + result.hourly.time[i].slice(0, 4);
          break
        }
      }
    }






    document.getElementById("weather_now").innerHTML = `
      <div>Weather now:</div>
      <div>├╴<span class="weather-icon">api time</span></span><span class="data_text">${time_now}</span></div>
      <div>├╴<span class="weather-icon">temperature</span></span><span class="data_text">${temp_now}</span></div>
      <div>├╴<span class="weather-icon">percieved temp</span></span><span class="data_text">${temp_felt_now}</span></div>
      <div>├╴<span class="weather-icon">uv-index</span></span><span class="data_text">${uv_index_now}</span></div>
      <div>╰╴<span class="weather-icon">DNI</span></span><span class="data_text">${direct_normal_irradiance}</div>
    `;

    document.getElementById("weather_today").innerHTML = `
      <div>Weather today:</div>
      <div>├╴<span class="weather-icon">max temp</span><span class="data_text">${max_temp_today}</span></div>
      <div>├╴<span class="weather-icon">min temp</span><span class="data_text">${min_temp_today}</span></div>
      <div>├╴<span class="weather-icon">sunset</span><span class="data_text">${sunset_today}</span></div>
      <div>╰╴<span class="weather-icon">moon phase</span><span class="data_text">${moon_phase_today}</span></div>
    `;

    document.getElementById("weather_tomorrow").innerHTML = `
      <div>Weather tomorrow:</div>
      <div>├╴<span class="weather-icon">max temp</span><span class="data_text">${max_temp_tomorrow}</span></div>
      <div>╰╴<span class="weather-icon">uv-index max</span><span class="data_text">${max_uv_index_tomorrow}</span></div>
    `;

    document.getElementById("weather_next").innerHTML = `
      <div>Weather future:</div>
      <div>╰╴<span class="weather-icon">next sun</span><span class="data_text">${next_time_DNI_over_120}</span></div>
    `;

    document.getElementById("weather_next").innerHTML ="🛈 A DNI over 120 constitutes as 'sunny'";


  } catch (error) {
    console.error(error.message);

    return "error";
  }

}

function get_date_string_now(){

  //generate a time string that can be compared to what is served in the api
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  now.setMinutes(now.getMinutes() >= 30 ? 60 : 0, 0, 0);
  const date_string_now = new Date(now.getTime()-offset).toISOString().slice(0, 16);

  return date_string_now;
}


function update_location(highAcc){

  return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
    } else {
      navigator.geolocation.getCurrentPosition(

        ({ coords }) => {

          document.getElementById("location").innerHTML = `
            <div>Location</div>
            <div>├╴<span class="weather-icon">latitude</span><span class="data_text">${coords.latitude}</span></div>
            <div>├╴<span class="weather-icon">longitude</span><span class="data_text">${coords.longitude}</span></div>
            <div>╰╴<span class="weather-icon">accuracy</span><span class="data_text">${coords.accuracy} m</span></div>
          `;
          resolve([coords.latitude, coords.longitude]);

        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: highAcc,
          timeout: 10_000,
          maximumAge: 60_000,
        }
      );
    }

  });
}




async function main(){


  const throbber_string = "⣷⣯⣟⡿⢿⣻⣽⣾";
  const throbber = document.getElementById("throbber")
  var i = 0;
  setInterval(() => {
    throbber.innerHTML = "Requesting Location "+throbber_string[i]
    i = (i + 1) % throbber_string.length;
  }, 100)

  

  //Default Berlin
  var latitude = 52.52;
  var longitude = 13.41;

  try {
    [latitude, longitude] = await update_location(false);
  } catch(err) {
    console.log("using berlin as location", err.message);
  } finally {
    throbber.hidden = true
  }

  latitude.toFixed(2);
  longitude.toFixed(2);

  const date_string = get_date_string_now();

  pullWeather(date_string, latitude, longitude);


}

main()