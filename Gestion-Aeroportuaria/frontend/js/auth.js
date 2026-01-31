const users = [
  { username: "ccr", password: "ccr123", role: "CCR" },
  { username: "supervisor1", password: "sup123", role: "SUPERVISOR" },
  { username: "tractorista1", password: "tra123", role: "TRACTORISTA" },
  { username: "maletero1", password: "mal123", role: "MALETERO" },
  { username: "cintero1", password: "cin123", role: "CINTERO" },
];

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value;
  const pass = document.getElementById("password").value;

  const found = users.find(
    u => u.username === user && u.password === pass
  );

  if (!found) {
    alert("Usuario o contraseña incorrectos");
    return;
  }

  localStorage.setItem("role", found.role);

  switch (found.role) {
    case "CCR":
      window.location.href = "ccr.html";
      break;
    case "SUPERVISOR":
      window.location.href = "supervisor.html";
      break;
    case "TRACTORISTA":
      window.location.href = "tractorista.html";
      break;
    case "MALETERO":
      window.location.href = "maletero.html";
      break;
    case "CINTERO":
      window.location.href = "cintero.html";
      break;
  }
});
