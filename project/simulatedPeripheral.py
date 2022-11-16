import socket
import sys

# data = self.request[0]
# socket = self.request[1]
# addr = self.client_address
# if len(data) != 4:
#     return

# print("{} received: {}".format(addr, data))
# (b1, b2, b3, b4) = data

# # if b1 == 1:
# data = bytearray([1, device_number, 0, 0])
# socket.sendto(data, addr)


def main():
    device_number = int(sys.argv[1])

    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    udp_socket.bind(('0.0.0.0', 8586))

    while True:
        data, addr = udp_socket.recvfrom(4)
        print(f'got {data} from {addr}')
        if len(data) != 4:
            continue

        b1, b2, b3, b4 = data
        udp_socket.sendto(bytearray([1, device_number, 0, 0]), addr)


if __name__ == '__main__':
    main()
