import subprocess
import threading
import os
from typing import Union
from dotenv import load_dotenv

load_dotenv(".env.local")


def env(extra_env: Union[dict, None] = None):
    env = os.environ.copy()
    if extra_env is not None:
        env.update(extra_env)
    return env


def start_next_app():
    _ = subprocess.run(
        ["npm", "run", "dev"],
        cwd="frontend",
        env=env({"API_URL": "http://localhost:8000"}),
    )


def start_go_backend():
    _ = subprocess.run(
        [
            "go",
            "run",
            "cmd/service/main.go",
            "--host",
            "localhost",
            "--port",
            "8000",
        ],
        cwd="api",
        env=env(),
    )


if __name__ == "__main__":
    t = threading.Thread(target=start_next_app)
    t.start()

    start_go_backend()
