import socket
import sys


def main():
    device_number = int(sys.argv[1])

    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    udp_socket.bind(('0.0.0.0', 8586))

    state = 0

    while True:
        data, addr = udp_socket.recvfrom(4)
        if len(data) != 4:
            continue

        b1, b2, b3, b4 = data
        if b1 == 2 and b2 == device_number:
            if state == 0:
                print("Turn On")
            else:
                print("Turn Off")
            state = not state


if __name__ == '__main__':
    main()
