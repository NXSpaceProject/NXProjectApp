# NXProjectApp

## Overview
NXProjectApp is a specialized mobile application built with React Native, designed to wirelessly control and monitor custom solid rocket motor hardware via Bluetooth Low Energy (BLE). It interfaces with an "NX" series flight computer/controller to perform static fire tests and monitor flight telemetry.

## Key Features

### 1. Static Fire Test Control
This module allows for the safe execution of static fire tests for solid rocket motors.
*   **Remote Ignition:** Remotely arm and ignite the motor from a safe distance using the "Start Test" functionality.
*   **Real-Time Data Visualization:** Receives and plots thrust data in real-time on a dynamic line chart.
*   **Performance Metrics:** Automatically calculates and displays maximum thrust in both Newtons (N) and Kilograms (kg).
*   **Safety Interlocks:**
    *   **Load Cell Verification:** Prevents ignition if the load cell readings are outside of a safe calibration range (+/- 50 units), ensuring the sensor is working correctly before the test.
    *   **Confirmation Dialogs:** Requires explicit user confirmation for critical actions like starting the test, aborting, or rebooting the system.
*   **Emergency Controls:** Instant access to "Abort" commands to stop the test sequence and "Reboot" controls to reset the hardware.
*   **Settings:** Configurable parameters such as light start thresholds.

![Screen](https://github.com/NXSpaceProject/NXProjectApp/blob/master/screens/screen_1.jpg)

### 2. Flight Computer Monitoring
A dedicated dashboard for monitoring the rocket during flight operations.
*   **Flight State Tracking:** Visualizes the current state of the rocket communication and flight phase (e.g., Checking Systems, Ready, Liftoff, Ascending, Descending, Landed).
*   **Telemetry:** Displays real-time 3-axis accelerometer data (X, Y, Z).
*   **Flight Logs:** Capability to access recorded flight data from the device's flash memory.

### 3. Hardware Integration
*   **Bluetooth Low Energy (BLE):** Scans for and connects to compatible devices (defaulting to device name 'BT05').
*   **Protocol:** Implements a custom serial-over-BLE protocol (`NX+` commands) for state management and data streaming.

## Tech Stack
*   **Framework:** React Native
*   **UI:** React Native Paper (Material Design)
