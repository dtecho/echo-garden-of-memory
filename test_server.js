# Check status
curl http://localhost:3000/status

# Make predictions (once model is trained)
curl -X POST http://localhost:3000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world"}'
