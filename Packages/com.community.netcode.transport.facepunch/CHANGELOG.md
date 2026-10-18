# Changelog
All notable changes to this package will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## 2.0.0-jpp (copia embebida en JuniorProgrammerPath)

Copiado de multiplayer-community-contributions en el commit 0fab6384 (2026-09-08).

### Changed
- `Shutdown()` ya no llama a `SteamClient.Shutdown()`. El cliente de Steam tiene
  un solo dueño, `SteamLobbyService`, para que cerrar la red no cierre el lobby.

## 2.0.0

### Changed
- Targets the Netcode for GameObjects 1.0.0 package.
- Renamed namespaces from MLAPI to Netcode.

### Removed
- Removed support for channels.
- No longer send 1 byte of channel information in each message.

## 1.0.0
First version of the Facepunch Transport as a Unity package.