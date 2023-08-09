# e2ee-webchat
KTU S6 Mini Project - End to End encrypted web-chat
# Working
Uses RSA asymmetric cryptography techniques to securely send messages between users. Enables trustless usage.

# How to run
Project uses flask as the backend. Python dependencies are managed using Pipenv. To install Pipenv:
``` pip install pipenv ```

Once pipenv is installed, cd to the repo folder and:
``` pipenv install ```

This will automagically setup a virtual environment and install needed dependencies for you.
Once installation is complete, run the 'app.py' inside 'src' folder within the virual environment
```
pipenv shell
cd src
python app.py
