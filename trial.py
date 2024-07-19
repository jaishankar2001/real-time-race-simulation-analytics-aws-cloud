import ctypes
import time

# Define the shared memory structure (example, adjust according to your needs)
class SPageFileGraphic(ctypes.Structure):
    _fields_ = [
        ("packetId", ctypes.c_int),
        ("accG", ctypes.c_float),
        ("fuel", ctypes.c_float),
        ("gas", ctypes.c_float),
        ("brake", ctypes.c_float),
        ("gear", ctypes.c_int),
        ("rpms", ctypes.c_int),
        ("steerAngle", ctypes.c_float),
        ("speedKmh", ctypes.c_float),
        # Add other relevant fields here
    ]

def read_shared_memory():
    try:
        memfile = "Local\\acpmf_graphics"
        mapfile = ctypes.windll.kernel32.OpenFileMappingW(0xF001F, False, memfile)
        if not mapfile:
            print("Could not open file mapping.")
            return None
        mapview = ctypes.windll.kernel32.MapViewOfFile(mapfile, 0xF001F, 0, 0, ctypes.sizeof(SPageFileGraphic))
        if not mapview:
            print("Could not map view of file.")
            return None
        return ctypes.cast(mapview, ctypes.POINTER(SPageFileGraphic))
    except Exception as e:
        print(f"Error accessing shared memory: {e}")
        return None

def main():
    shared_memory = read_shared_memory()
    if not shared_memory:
        print("Failed to access shared memory.")
        return

    print("Successfully accessed shared memory. Reading data...")

    while True:
        try:
            
            ac_data = shared_memory.contents
            print("getting data", ac_data)

            # Get the speed in km/h
            speed = ac_data.speedKmh

            # Get the brake input (0 to 1)
            brake_input = ac_data.brake

            # Debug output
            print(f"Raw speed value: {speed}, Raw brake input: {brake_input}")

            # Sleep for a short interval to reduce CPU usage
            time.sleep(1)
        except Exception as e:
            print(f"Error reading from shared memory: {e}")

if __name__ == "__main__":
    main()
