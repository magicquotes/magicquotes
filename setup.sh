# update ubuntu
sudo apt update -y && sudo apt upgrade -y &&
# fetch latest node.js
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash &&
# install latest node.js
sudo apt install nodejs -y &&
# setup node.js
sudo setcap 'cap_net_bind_service=+ep' `which node` &&
# clone magicquotes
git clone https://github.com/magicquotes/magicquotes &&
# install magicquotes deps
cd magicquotes && npm i