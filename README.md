# Carnalia

Base jugable de duelos PvP **locales** 1 contra 1 por turnos. Dos personas comparten el dispositivo; cada una prepara una build y confirma una acción oculta antes de que el motor resuelva la ronda. La sincronización entre dispositivos queda para una actualización posterior.

## Ejecutar

Requiere Node.js 20 o superior. No hay dependencias externas.

```sh
npm run check
npm run dev
```

Abre `http://localhost:4173`. También puede servirse como sitio estático desde la raíz del repositorio. La partida se conserva en `localStorage` de ese navegador, con validación de versión; no se sincroniza con otros dispositivos.

Para Vercel: `npm run build` genera `dist/` y el proyecto publica ese directorio como sitio estático.

## Arquitectura

| Capa | Responsabilidad |
| --- | --- |
| `src/content/` | Razas, clases, talentos, equipo, dones, habilidades y estados como datos. |
| `src/engine/` | Build, estadísticas, RNG, estado serializable, turnos, combate, validación y persistencia. Sin DOM. |
| `src/assets/manifest.js` | Identificadores visuales y descriptores de sprites de prueba. |
| `src/ui/` | Interfaz y compositor de pixel art por capas sobre canvas. |
| `test/` | Pruebas del motor y de una partida completa. |

`GameState` contiene sala local, dos jugadores, fase, preparación, combate y resultado. Las transiciones devuelven un estado nuevo: `createGame → confirmPlayer → submitAction → resolveRound → result`. `CombatResolver` recibe los dos comandos confirmados y construye un historial serializable. La interfaz presenta el resultado y nunca calcula el daño. Un proveedor de red futuro podrá enviar acciones y estados serializados al mismo motor; el servidor deberá ser autoridad de la partida y validar cada comando.

La raza, clase, talentos, don, equipo y estados alimentan un único cálculo de estadísticas. Los objetos apuntan a IDs de `assetManifest`; el compositor dibuja cuerpo, piel, pelo, capa, armadura, accesorios, reliquia y arma en capas. Los sprites provisionales se sustituyen desde el registro de assets.

## Alcance de esta base

- Selección manual o Azar con tres tiradas por jugador.
- Personalización de piel, cabello, peinado y capa; arma y armadura visibles.
- Acción oculta en el relevo local, coste de energía, velocidad, defensa, guardia, curación, quemadura, lentitud, bastión, pasivas, victoria y empate tras 30 rondas.
- Guardado local y crónica de rondas. Los cambios de contenido incompatibles requieren migración antes de subir `schemaVersion` o `contentVersion`.
- Herramienta de inspección del estado visible solo en `localhost`.

Los nombres, habilidades y gráficos son contenido **demostrativo**, preparado para ampliar. No hay salas online, cuentas, monstruos ni biblioteca definitiva de personajes. No se necesita backend en esta versión.
