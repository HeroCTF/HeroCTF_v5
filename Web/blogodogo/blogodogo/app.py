#!/usr/bin/env python3
from flask import Flask, request, redirect, url_for, flash
import lorem
from sqlalchemy.exc import IntegrityError

import os
import random
from secrets import token_hex
from datetime import datetime

from config import TestConfig, db, login_manager
from src.routes import bp_routes
from src.models import Authors, Posts
from src.utils import generate_hash


def create_app():
    app = Flask(__name__)

    app.config.from_object(TestConfig)

    login_manager.init_app(app)
    db.init_app(app)
    app.register_blueprint(bp_routes)

    with app.app_context():
        db.create_all()

        @login_manager.user_loader
        def load_user(author_id):
            return Authors.query.get(int(author_id))

        @login_manager.unauthorized_handler
        def unauthorized_callback():
            flash("You need to be authenticated.", "warning")
            return redirect(url_for('bp_routes.login'))


        authors = []
        authors.append(Authors(
            id=17,
            username=os.getenv("ADMIN_USERNAME"),
            password=os.getenv("ADMIN_PASSWORD"),
            admin=True,
            url="https://example.com"
        ))
    
        names = ["bob", "alice", "john", "doggo", "toto", "lolo", "tata"]
        for name in names:
            authors.append(Authors(
                username=name,
                password=token_hex(),
                admin=False,
                url=""
            ))

        db.session.add_all(authors)
        db.session.commit()

        for _ in range(32):
            timestamp = random.randint(1603945763, 1683945800)

            db.session.add(Posts(
                title=lorem.get_word(count=4, sep=" "),
                subtitle=lorem.get_word(count=4, sep=" "),
                slug=lorem.get_word(count=2, sep="-") + token_hex(4),
                content=lorem.get_paragraph(),
                draft=False,
                hash_preview=generate_hash(timestamp),
                created_at=datetime.fromtimestamp(timestamp),
                author_id=random.choice(authors).id
            ))

        timestamp = 1683946387
        db.session.add(Posts(
            title="Secret blog post",
            subtitle="Secret post!!",
            slug="secret-blog-posts",
            content=f"""
            Well played ! You can now register users !

            Here is the referral code: {os.getenv('REFERRAL_CODE')}.
            
            {os.getenv('FLAG_1')}
            """,
            draft=True,
            hash_preview=generate_hash(timestamp),
            created_at=datetime.fromtimestamp(timestamp),
            author_id=authors[0].id
        ))

        db.session.commit()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
