#!/usr/bin/env bash
set -o errexit

python manage.py migrate --no-input

if [ "$SEED_ON_DEPLOY" = "true" ]; then
  python manage.py seed_mfetms
fi

exec gunicorn mfetms.wsgi:application --bind 0.0.0.0:$PORT
