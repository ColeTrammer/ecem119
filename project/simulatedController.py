import socket
import sys


def main():
    device_number = int(sys.argv[1])

    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

    udp_socket.sendto(
        bytearray([2, device_number, 0, 0]), ('255.255.255.255', 8586))


if __name__ == '__main__':
    main()
