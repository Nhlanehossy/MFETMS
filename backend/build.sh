#!/usr/bin/env bash
set -o errexit

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

if [ "$SEED_ON_DEPLOY" = "true" ]; then
  python manage.py seed_mfetms
fi
