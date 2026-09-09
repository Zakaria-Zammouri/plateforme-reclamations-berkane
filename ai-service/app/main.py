from typing import Literal

import ollama
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field


app = FastAPI(
    title="SAWTI — Microservice IA",
    description="Microservice d'analyse et de classification des réclamations.",
    version="2.1.0",
)


Priorite = Literal[
    "BASSE",
    "NORMALE",
    "HAUTE",
    "URGENTE",
]


class AnalyzeRequest(BaseModel):
    titre: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)


class AnalyzeResponse(BaseModel):
    categorie: str
    departement: str
    service: str
    priorite: Priorite
    confiance: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )
    reponse: str = Field(
        ...,
        min_length=1,
    )


SYSTEM_PROMPT = """
Tu es le système d'intelligence artificielle de la plateforme SAWTI
de la Commune de Berkane.

Ta mission est d'analyser une réclamation citoyenne de manière cohérente
et prudente, puis de proposer une réponse administrative courte,
professionnelle et adaptée au citoyen.

Tu dois retourner UNIQUEMENT les informations demandées
dans le format JSON attendu.

RÈGLES :

1. categorie

Choisis une catégorie courte et descriptive correspondant au problème.

Exemples :
- ECLAIRAGE_PUBLIC
- VOIRIE
- PROPRETE
- EAU_ASSAINISSEMENT
- ESPACES_VERTS
- URBANISME
- TRANSPORT
- SECURITE
- ADMINISTRATION
- AUTRE


2. departement

Choisis le département municipal le plus pertinent.

Exemples :
- SERVICES_TECHNIQUES
- URBANISME
- ADMINISTRATION
- ENVIRONNEMENT
- SECURITE
- AUTRE


3. service

Choisis le service municipal correspondant au problème.

Exemples :
- ECLAIRAGE_PUBLIC
- VOIRIE
- PROPRETE
- EAU_ASSAINISSEMENT
- ESPACES_VERTS
- URBANISME
- ETAT_CIVIL
- ADMINISTRATION
- AUTRE


4. priorite

Choisis exactement une seule valeur parmi :
- BASSE
- NORMALE
- HAUTE
- URGENTE

Utilise URGENTE lorsqu'il existe un danger immédiat,
un risque sérieux pour les personnes, une situation critique
ou un besoin d'intervention immédiate.

Utilise HAUTE lorsqu'il existe un problème important,
un risque potentiel ou une situation nécessitant une intervention
rapide sans caractère immédiatement critique.

Utilise NORMALE pour une réclamation courante sans urgence particulière.

Utilise BASSE pour un problème mineur ou sans conséquence importante.


5. confiance

Donne un nombre entre 0 et 1 représentant ton niveau de confiance
dans la classification globale.


6. reponse

Propose une réponse administrative courte, professionnelle,
polie et adaptée à la situation décrite.

La réponse doit :

- être rédigée en français ;
- reconnaître la réclamation du citoyen ;
- rester neutre et professionnelle ;
- ne jamais prétendre qu'une intervention a déjà été réalisée ;
- ne jamais inventer une date, une personne, un service précis
  non déduit de l'analyse ;
- ne jamais promettre un résultat certain ;
- indiquer qu'une vérification ou une intervention sera effectuée
  par le service compétent ;
- être directement utilisable comme brouillon par un agent ;
- contenir environ 2 à 4 phrases ;
- ne pas contenir de titre ;
- ne pas contenir de guillemets ;
- ne pas commencer par "Réponse :" ;
- ne pas contenir de recommandations internes destinées à l'agent.

Exemple de style :

"Nous vous remercions pour votre signalement concernant
le dysfonctionnement de l’éclairage public. Votre réclamation
sera transmise au service compétent afin de vérifier la situation
et de procéder aux interventions nécessaires."


IMPORTANT :

Ne retourne jamais de texte explicatif autour du JSON.
"""


def analyser_reclamation(
    titre: str,
    description: str,
) -> AnalyzeResponse:
    prompt = f"""
Analyse la réclamation suivante et propose également une réponse type.

TITRE :
{titre}

DESCRIPTION :
{description}
"""

    try:
        response = ollama.chat(
            model="gemma3:latest",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            format=AnalyzeResponse.model_json_schema(),
            options={
                "temperature": 0,
            },
        )

        contenu = response["message"]["content"]

        resultat = AnalyzeResponse.model_validate_json(
            contenu,
        )

        return resultat

    except Exception as error:
        print(
            "Erreur lors de l'analyse IA :",
            error,
        )

        raise HTTPException(
            status_code=503,
            detail="Le service d'intelligence artificielle est momentanément indisponible.",
        )


@app.get("/")
def root():
    return {
        "service": "SAWTI — Microservice IA",
        "status": "ok",
        "version": "2.1.0",
        "model": "gemma3:latest",
    }


@app.get("/health")
def health():
    try:
        ollama.list()

        return {
            "status": "ok",
            "ollama": "ok",
            "model": "gemma3:latest",
        }

    except Exception:
        return {
            "status": "degraded",
            "ollama": "indisponible",
        }


@app.post(
    "/analyze",
    response_model=AnalyzeResponse,
)
def analyze_reclamation(
    request: AnalyzeRequest,
):
    return analyser_reclamation(
        request.titre,
        request.description,
    )