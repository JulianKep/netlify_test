const dni = JSON.parse(
  sessionStorage.getItem("dni") || "[]"
);

const labels = JSON.parse(
  sessionStorage.getItem("dni_labels") || "[]"
).map((time) => {
  // Aus "2026-08-27T15:00" wird "27.08. 15:00"
  return (
    time.slice(8, 10) +
    "." +
    time.slice(5, 7) +
    ". " +
    time.slice(11, 16)
  );
});

console.log(dni);
console.log(labels);

try {
new Chart(document.getElementById("dni_chart"), {
  type: "line",

  data: {
    labels,

    datasets: [
      {
        label: "DNI W/m²",
        data: dni,
        borderColor: "orange",
        backgroundColor: "orange",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        stepped: true
      }
    ]
  },

  options: {
    responsive: true,
    interaction: {
      intersect: false,
      mode: "index"
    },

    scales: {
      x: {
        ticks: {
          maxTicksLimit: 8
        }
      },

      y: {
        title: {
          display: true,
          text: "DNI W/m²"
        }
      }
    }
  }
});
} catch (error) {
  console.error("Diagramm konnte nicht geladen werden:", error);
}