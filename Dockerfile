FROM nginx:1.27-alpine
LABEL org.opencontainers.image.title="BhaveshPay Demo"
LABEL org.opencontainers.image.description="Fictional wallet UI for Docker Swarm and Jenkins practice"
COPY index.html /usr/share/nginx/html/index.html
COPY styles.css /usr/share/nginx/html/styles.css
COPY app.js /usr/share/nginx/html/app.js
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
