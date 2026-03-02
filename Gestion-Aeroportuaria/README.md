# Sistema de Optimización de Rotación de Personal – Operaciones de Rampa


## ----- Problema

Durante mi experiencia trabajando como operador de rampa, observe que la asignacion de tareas se realizaba manualmente. Generando:

- Demoras operativas
- Depedencia total del supervisor (ya que este se encargaba de ir a buscar a su equipo de trabajo)
- Uso ineficiente de vehiculos internos
- Distribucion desigual del descanso
- Falta de trazabilidad

Este proyecto modela una solucion tecnica a ese problema real.


## ----- Arquitectura

Frontend:
- HTML
- CSS
- JavaScript

Backend:
- Python
- FastAPI

Base de datos:
- SQLite


## ----- Roles del sistema

1. CCR(coordinacion) -> responsable de la gestion general de la operacion.

    - Visualizar los vuelos del día.
    - Ver el estado de los grupos operativos.
    - Asignar automáticamente grupos a vuelos.
    - Supervisar el flujo de trabajo en tiempo real.

2. Supervisor -> encargado de liderar un grupo operativo en plataforma, arribos o salidas.

    - Ver el vuelo asignado a su grupo.
    - Consultar el estado de la operación.
    - Marcar una tarea como “Trabajo finalizado”.
    - Devolver el grupo a la cola de disponibilidad.

3. Tractorista -> responsable del traslado de quipamiento o aeronaves dentro de la plataforma.

    - Visualizar el vuelo asignado.
    - Ver el estado de la operación.
    - Consultar su disponibilidad.

4. Cintero -> responsable de operar la cinta de carga/descarga de equipaje.

    - Visualizar su grupo operativo.
    - Consultar el vuelo asignado.
    - Ver el tipo de operación (carga o descarga).

5. Maletero -> personal encargado de la carga y descarga de equipaje de las aeronaves y de los sectores de arribo/salida.

    - Visualizar el grupo al que pertenece.
    - Ver el vuelo asignado.
    - Consultar el estado del operativo.


## ---- Seguridad

- Autenticación por roles
- Validación de acceso en backend
- Control de estados
- Uso de variables de entorno


## ----- Estado

Proyecto en desarrollo como práctica profesional y portfolio.
No representa una herramienta oficial de ninguna aerolínea.


## ----- Aprendizajes

- Modelado de dominio basado en experiencia real
- Separación de responsabilidades
- Diseño de lógica de rotación equitativa
- Implementación de control de acceso por roles