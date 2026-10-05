import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    # Load environment variables
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.env"))
    if os.path.exists(env_path):
        load_dotenv(env_path)

    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize SQLite database and seed data
    from .database import init_db
    init_db()

    # Register blueprints
    from .routes.stations import stations_bp
    from .routes.recommendations import recommendations_bp
    from .routes.telemetry import telemetry_bp
    from .routes.osint import osint_bp
    from .routes.geo import geo_bp
    from .routes.weather import weather_bp

    app.register_blueprint(stations_bp, url_prefix="/api/stations")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    app.register_blueprint(telemetry_bp, url_prefix="/api/telemetry")
    app.register_blueprint(osint_bp, url_prefix="/api/osint")
    app.register_blueprint(geo_bp, url_prefix="/api")
    app.register_blueprint(weather_bp, url_prefix="/api/weather")

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "EV-Agent OSINT Platform",
            "version": "2.0.0-osint",
            "mode": os.getenv("OSINT_MODE", "mock"),
            "database": "SQLite Connected"
        })

    return app
