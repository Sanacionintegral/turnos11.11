const form = document.getElementById("turno-form");
const nombreInput = document.getElementById("nombre");
const celularInput = document.getElementById("celular");
const diaSelect = document.getElementById("dia");
const horaSelect = document.getElementById("hora");

const API_URL = "https://script.google.com/macros/s/AKfycbwe3KtS6BlLILPAmrHA05bynpDEtGOlh4sc2ydQ_CmUk8ryjF9ymJ8_RlHECEUQ4sUUtg/exec";

// Cargar turnos ocupados
fetch(API_URL)
  .then((res) => res.json())
  .then((ocupados) => {
    const dias = generarDiasDisponibles();
    dias.forEach((dia) => {
      const option = document.createElement("option");
      option.value = dia;
      option.textContent = dia;
      diaSelect.appendChild(option);
    });

    diaSelect.addEventListener("change", () => {
      const diaElegido = diaSelect.value;
      const horas = generarHorasPorDia(diaElegido);

      horaSelect.innerHTML = "";
      horas.forEach((hora) => {
        const yaOcupado = ocupados.some(t => t.dia === diaElegido && t.hora === hora);
        if (!yaOcupado) {
          const option = document.createElement("option");
          option.value = hora;
          option.textContent = hora;
          horaSelect.appendChild(option);
        }
      });
    });
  });

// Enviar formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value;
  const celular = celularInput.value;
  const dia = diaSelect.value;
  const hora = horaSelect.value;

  if (!nombre || !celular || !dia || !hora) {
    alert("Por favor completá todos los campos.");
    return;
  }

  // Enviar a WhatsApp
  const url = `https://wa.me/542235931151?text=Ya reservé mi turno para el ${dia} a las ${hora}. Mi nombre es ${nombre} y mi número es ${celular}`;
  window.open(url, "_blank");

  // Enviar a Google Sheets
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ dia, hora, nombre, celular }),
    headers: {
      "Content-Type": "application/json"
    }
  });
});

function generarDiasDisponibles() {
  const dias = [];
  const hoy = new Date();
  for (let i = 0; i <= 15; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    const diaSemana = d.getDay();
    const fecha = d.getDate().toString().padStart(2, "0") + "/" + (d.getMonth() + 1).toString().padStart(2, "0");
    if ((diaSemana >= 1 && diaSemana <= 5) || diaSemana === 6) {
      const diaTexto = d.toLocaleDateString("es-AR", { weekday: "long" }) + " " + fecha;
      dias.push(diaTexto.charAt(0).toUpperCase() + diaTexto.slice(1));
    }
  }
  return dias;
}

function generarHorasPorDia(diaTexto) {
  const esSabado = diaTexto.toLowerCase().includes("sábado");
  const horas = [];
  const inicio = esSabado ? 8 : 6;
  const fin = esSabado ? 16 : 20;
  for (let h = inicio; h < fin; h++) {
    const horaStr = h.toString().padStart(2, '0') + ":00";
    horas.push(horaStr);
  }
  return horas;
}
