import socket
import time
import threading
import socketserver

devices = dict()


class RequestHandler(socketserver.DatagramRequestHandler):
    def handle(self):
        data = self.request[0]
        addr = self.client_address
        print("{} received: {}".format(self.client_address, data))

        if len(data) != 4:
            return

        b1, b2, b3, b4 = data
        if b1 == 1:
            devices[len(devices) + 1] = addr


udp_server = socketserver.UDPServer(('0.0.0.0', 8585), RequestHandler)


def spawn_background_task():
    def task():
        broadcast_address = ("255.255.255.255", 8586)
        udp_server.socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        data = bytearray([1, 0, 0, 0])

        while True:
            udp_server.socket.sendto(data, broadcast_address)

            time.sleep(5)

    threading.Thread(target=task).start()


def spawn_server_task():
    def task():
        udp_server.serve_forever()

    threading.Thread(target=task).start()


def main():
    spawn_background_task()
    spawn_server_task()


if __name__ == '__main__':
    main()
