const WIKIDATA_API = "https://www.wikidata.org/w/api.php";

export function getWikidataFromFeature(feature) {
  if (!feature) {
    return null;
  }

  const properties = feature.properties || feature;

  const possibleIds = [
    properties.wikidata,
    properties.wikidata_id,
    properties.wikidataId,
  ];

  for (const value of possibleIds) {
    if (!value) {
      continue;
    }

    const stringValue = String(value).trim();

    if (/^Q\d+$/i.test(stringValue)) {
      return stringValue.toUpperCase();
    }
  }

  return null;
}

export async function getWikidataEntity(qid) {
  if (!qid) {
    return null;
  }

  try {
    const url =
      `${WIKIDATA_API}?` +
      new URLSearchParams({
        action: "wbgetentities",
        ids: qid,
        format: "json",
        languages: "es|en",
        props: "labels|descriptions|claims|sitelinks",
        origin: "*",
      });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Wikidata HTTP ${response.status}`);
    }

    const data = await response.json();

    const entity = data.entities?.[qid];

    if (!entity) {
      return null;
    }

    return entity;
  } catch (error) {
    console.error("Error consultando Wikidata:", error);
    return null;
  }
}

export function getWikidataLabel(entity) {
  if (!entity?.labels) {
    return "";
  }

  return entity.labels.es?.value || entity.labels.en?.value || "";
}

export function getWikidataDescription(entity) {
  if (!entity?.descriptions) {
    return "";
  }

  return entity.descriptions.es?.value || entity.descriptions.en?.value || "";
}

export function getClaimValue(entity, property) {
  const claims = entity?.claims?.[property];

  if (!claims || !claims.length) {
    return null;
  }

  const mainsnak = claims[0]?.mainsnak;

  if (!mainsnak) {
    return null;
  }

  const datavalue = mainsnak.datavalue;

  if (!datavalue) {
    return null;
  }

  return datavalue.value;
}

export function getClaimQid(entity, property) {
  const value = getClaimValue(entity, property);

  if (value && typeof value === "object" && value.id) {
    return value.id;
  }

  return null;
}

export async function getRelatedEntityLabel(qid) {
  if (!qid) {
    return null;
  }

  const entity = await getWikidataEntity(qid);

  return getWikidataLabel(entity);
}

export async function getWikidataInfo(qid) {
  if (!qid) {
    return null;
  }

  const entity = await getWikidataEntity(qid);

  if (!entity) {
    return null;
  }

  const label = getWikidataLabel(entity);
  const description = getWikidataDescription(entity);

  const instanceOf = getClaimQid(entity, "P31");
  const countryQid = getClaimQid(entity, "P17");
  const locatedInQid = getClaimQid(entity, "P131");
  const capitalQid = getClaimQid(entity, "P36");
  const population = getClaimValue(entity, "P1082");
  const area = getClaimValue(entity, "P2046");
  const inception = getClaimValue(entity, "P571");
  const coordinates = getClaimValue(entity, "P625");
  const website = getClaimValue(entity, "P856");
  const elevation = getClaimValue(entity, "P2044");
  const leaderQid = getClaimQid(entity, "P6");

  const subdivisions = entity.claims?.P150 || [];

  const subdivisionQids = subdivisions
    .map((item) => item?.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);

  const wikipediaEs = entity.sitelinks?.eswiki?.title || null;
  const wikipediaEn = entity.sitelinks?.enwiki?.title || null;

  return {
    qid,
    label,
    description,
    instanceOf,
    countryQid,
    locatedInQid,
    capitalQid,
    population,
    area,
    inception,
    coordinates,
    website,
    elevation,
    leaderQid,
    subdivisionQids,
    wikipediaEs,
    wikipediaEn,
    claims: entity.claims || {},
    raw: entity,
  };
}

export async function getWikidataFromFeatureAsync(feature) {
  const qid = getWikidataFromFeature(feature);

  if (!qid) {
    return null;
  }

  return await getWikidataInfo(qid);
}
