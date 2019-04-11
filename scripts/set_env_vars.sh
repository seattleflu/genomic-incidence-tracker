#!/usr/bin/env bash
echo "setting environment variables for development only"
echo "(these are set manually on the heroku server, and are different!)"

export GENOMIC_INCIDENCE_TRACKER_USERNAME="local";
export GENOMIC_INCIDENCE_TRACKER_PASSWORD="aaa";
export GENOMIC_INCIDENCE_TRACKER_JWT_SECRET="devsecret";
