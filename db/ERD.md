# Diagrama ER (simplificado)

Este proyecto usa:

- **Postgres** para usuarios
- **MongoDB** para reservas

Para cumplir el requisito de "diagramas de BD", aquí tienes un diagrama ER
en formato **Mermaid** (puedes pegarlo en herramientas compatibles o
en VS Code con extensión de Mermaid para exportar a imagen).

```mermaid
erDiagram
  USERS {
    int id PK
    text email "unique"
    text nombre
    text password_hash
  }

  RESERVAS {
    string _id PK
    int userId "referencia a USERS.id"
    string laboratorio
    string fecha "YYYY-MM-DD"
    string horaInicio "HH:mm"
    string horaFin "HH:mm"
    string motivo
  }

  USERS ||--o{ RESERVAS : "tiene"
```

> Nota: la relación se materializa por `userId` dentro del documento de reserva.
