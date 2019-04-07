import json
import random, math

# obtain valid list of "residence_census_tract"
with open("./data/seattle.geoJson") as fh:
  geo = json.load(fh)
census_ids = [feat["properties"]["GEOID"] for feat in geo["census"]["features"]]

results = []
for n in range(0, 1200):
  result = {}
  result["sex"] = random.choice(["male", "female"])
  result["residence_census_tract"] = census_ids[math.floor(random.betavariate(1, 2)*len(census_ids))]
  result["age"] = math.floor(random.triangular(1, 90, 20))
  result["flu_shot"] = random.betavariate(1, 2) > 0.5
  results.append(result)

with open("./data/mockResults.json", 'w') as fh:
  json.dump(results, fh, indent=2)

