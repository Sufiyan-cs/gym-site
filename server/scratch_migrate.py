import os
import re

directory = r"c:\Users\SUFIYAN\Desktop\Temp\gym-site\server\routes"

for filename in os.listdir(directory):
    if filename.endswith(".js"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            content = f.read()

        if 'better-sqlite3' in content:
            # Replace imports
            content = re.sub(
                r"const Database = require\('better-sqlite3'\);\nconst path = require\('path'\);\n",
                "const { query, queryOne, run } = require('../db/connection');\n",
                content
            )
            # Remove getDb definition
            content = re.sub(r"const getDb = \(\) => new Database\(path\.join\(__dirname, '\.\.', 'db', 'gym\.db'\)\);\n+", "", content)

            # Replace block db operations
            # `const db = getDb();`
            content = re.sub(r"\s*const db = getDb\(\);\n", "\n", content)
            
            # `db.close();`
            content = re.sub(r"\s*db\.close\(\);\n", "\n", content)

            # db.prepare(...).all()
            content = re.sub(r"db\.prepare\((.*?)\)\.all\((.*?)\)", r"query(\1, [\2])", content)
            content = re.sub(r"db\.prepare\((.*?)\)\.all\(\)", r"query(\1)", content)

            # db.prepare(...).get()
            content = re.sub(r"db\.prepare\((.*?)\)\.get\((.*?)\)", r"queryOne(\1, [\2])", content)
            content = re.sub(r"db\.prepare\((.*?)\)\.get\(\)", r"queryOne(\1)", content)

            # db.prepare(...).run()
            content = re.sub(r"db\.prepare\((.*?)\)\.run\((.*?)\)", r"run(\1, [\2])", content)
            content = re.sub(r"db\.prepare\((.*?)\)\.run\(\)", r"run(\1)", content)

            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated {filename}")
