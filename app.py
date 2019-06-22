import os

import pandas as pd

import json
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/tx_data.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# engine = create_engine("sqlite:///db/tx_data.sqlite")
# inspector = inspect(engine)

# Save references to each table
income = Base.classes.Per_Capita_Personal_Income
unemployment = Base.classes.Unemployment_Rate
population = Base.classes.population
tempreferance = Base.classes.combine_schools_zip_geo
air_quality = Base.classes.output


# defining routs,  quering DB, returning info

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/counties")
def counties():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(unemployment).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    return jsonify(list(df.County))


@app.route("/unemp")
def unemp():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(unemployment).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    my_dict = dict(zip(list(df.County), list(df.Unemployment)))
    return jsonify(my_dict)

@app.route("/income")
def inc():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(income).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    my_dict = dict(zip(list(df.County), list(df.Income)))
    return jsonify(my_dict)


@app.route("/population")
def popul():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(population).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    my_dict = dict(zip(list(df.County), list(df.Population)))
    return jsonify(my_dict)

@app.route("/school")
def school():
    """Return a list of sample names."""


    stmt = db.session.query(tempreferance).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Return a list of the column names (sample names)
    my_dict = df.to_dict(orient='records')
    j = json.dumps(my_dict)

    return j


@app.route("/air_quality")
def air():
   """Return a list of sample names."""

   # Use Pandas to perform the sql query
   stmt = db.session.query(air_quality).statement
   df = pd.read_sql_query(stmt, db.session.bind)

   # Return a list of the column names (sample names)
   my_dict = df.to_dict(orient='records')
   j = json.dumps(my_dict)

   return j




if __name__ == "__main__":
    app.run()
