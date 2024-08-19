FROM registry.see.asseco.com/public/alpine:3
COPY --chown=1001:0 ci/assets/module.json /module/
COPY --chown=1001:0 dist/party-lcm-ui/fesm2022/asseco-party-lcm-ui.umd.min.js /module/assets/party-lcm-ui/
