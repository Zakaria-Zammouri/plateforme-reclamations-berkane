import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ExportReclamation = {
  numeroClassement: number
  titre: string | null
  statut: string
  priorite: string
  departement: string | null
  service: string | null
  createdAt: string
  user?: {
    nom: string
    email: string
  }
}

function getStatusLabel(statut: string) {
  switch (statut) {
    case 'EN_ATTENTE':
      return 'En attente'

    case 'EN_COURS':
      return 'En cours'

    case 'TRAITEE':
      return 'Traitée'

    case 'REJETEE':
      return 'Rejetée'

    default:
      return statut
  }
}

function getPriorityLabel(priorite: string) {
  switch (priorite) {
    case 'BASSE':
      return 'Basse'

    case 'NORMALE':
      return 'Normale'

    case 'HAUTE':
      return 'Haute'

    case 'URGENTE':
      return 'Urgente'

    default:
      return 'Normale'
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR')
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

export function exportReclamationsCsv(
  reclamations: ExportReclamation[],
) {
  const headers = [
    'Référence',
    'Titre',
    'Citoyen',
    'Email',
    'Département',
    'Service',
    'Priorité',
    'Statut',
    'Date de création',
  ]

  const rows = reclamations.map(
    (reclamation) => [
      `#${reclamation.numeroClassement}`,
      reclamation.titre || 'Sans titre',
      reclamation.user?.nom || 'Non renseigné',
      reclamation.user?.email || 'Non renseigné',
      reclamation.departement || 'Non renseigné',
      reclamation.service || 'Non renseigné',
      getPriorityLabel(reclamation.priorite),
      getStatusLabel(reclamation.statut),
      formatDate(reclamation.createdAt),
    ],
  )

  const csv = [
    headers.map(escapeCsv).join(';'),
    ...rows.map((row) =>
      row.map(escapeCsv).join(';'),
    ),
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF' + csv],
    {
      type: 'text/csv;charset=utf-8;',
    },
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url

  link.download = `SAWTI_reclamations_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function exportReclamationsPdf(
  reclamations: ExportReclamation[],
  role: 'ADMIN' | 'AGENT',
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const title =
    role === 'ADMIN'
      ? 'SAWTI — Rapport des réclamations'
      : 'SAWTI — Réclamations à traiter'

  const subtitle = `Commune de Berkane — ${formatDate(
    new Date().toISOString(),
  )}`

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 16)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, 14, 23)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  doc.text(
    `Nombre de réclamations : ${reclamations.length}`,
    14,
    30,
  )

  autoTable(doc, {
    startY: 36,

    head: [
      [
        'Référence',
        'Titre',
        'Citoyen',
        'Département',
        'Service',
        'Priorité',
        'Statut',
        'Date',
      ],
    ],

    body: reclamations.map(
      (reclamation) => [
        `#${reclamation.numeroClassement}`,
        reclamation.titre || 'Sans titre',
        reclamation.user?.nom ||
          'Non renseigné',
        reclamation.departement ||
          'Non renseigné',
        reclamation.service ||
          'Non renseigné',
        getPriorityLabel(
          reclamation.priorite,
        ),
        getStatusLabel(
          reclamation.statut,
        ),
        formatDate(
          reclamation.createdAt,
        ),
      ],
    ),

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle',
    },

    headStyles: {
      fontStyle: 'bold',
    },

    columnStyles: {
      0: {
        cellWidth: 20,
      },

      1: {
        cellWidth: 48,
      },

      2: {
        cellWidth: 38,
      },

      3: {
        cellWidth: 40,
      },

      4: {
        cellWidth: 34,
      },

      5: {
        cellWidth: 28,
      },

      6: {
        cellWidth: 28,
      },

      7: {
        cellWidth: 25,
      },
    },
  })

  const filename =
    role === 'ADMIN'
      ? 'SAWTI_Rapport_Reclamations_ADMIN.pdf'
      : 'SAWTI_Rapport_Reclamations_AGENT.pdf'

  doc.save(filename)
}