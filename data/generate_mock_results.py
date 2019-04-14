import json
import random, math

# obtain valid list of "residence_census_tract"
with open("./data/seattle.geoJson") as fh:
  geo = json.load(fh)
census_ids = [feat["properties"]["GEOID"] for feat in geo["census"]["features"]]

# "pathogen" fields (taken from simulatedSubjectDatabase.csv)
pathogens = ["h1n1pdm", "h3n2", "otherili", "rsva", "vic", "yam", "negative"]

results = []
for n in range(0, 1200):
  result = {}
  result["sex"] = random.choice(["male", "female"])
  result["residence_census_tract"] = census_ids[math.floor(random.betavariate(1, 2)*len(census_ids))]
  result["age"] = math.floor(random.triangular(1, 90, 20))
  result["flu_shot"] = random.betavariate(1, 2) > 0.5
  result["pathogen"] = pathogens[math.floor(random.betavariate(0.5, 2)*len(pathogens))]

  results.append(result)

with open("./data/results.json", 'w') as fh:
  json.dump(results, fh, indent=2)

