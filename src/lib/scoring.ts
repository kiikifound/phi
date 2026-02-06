import ideals from '../data/ideals.json'
import schools from '../data/schools.json'
import neighbors from '../data/neighbors.json'
import questions from '../data/questions.json'

export type SchoolId = keyof typeof ideals
export type AnswerMap = Record<string, number>

export const AXES = [
  '从经验出发  ↔  从理论出发',
  '解释世界  ↔  改变世界',
  '澄清概念  ↔  理解体验',
  '关注个人处境  ↔  关注社会结构',
  '寻找共通规律  ↔  强调情境差异',
]

function toPercentRightFromBipolar(v1to7: number): number {
  // 1..7 where 1=strong A (left), 7=strong B (right)
  return ((v1to7 - 1) / 6) * 100
}

function similarity(user: number[], ideal: number[]): number {
  // weighted euclidean -> similarity 0..100
  const w = [1.0, 1.0, 1.05, 1.05, 1.0]
  let sum = 0
  for (let i=0;i<5;i++){
    const d = user[i]-ideal[i]
    sum += w[i]*d*d
  }
  const dist = Math.sqrt(sum)
  return 100 * Math.exp(-dist/45)
}

function schoolName(id: string) {
  const s = (schools as any[]).find(x=>x.id===id)
  return s?.name ?? id
}

export function computeUserVec(ans: AnswerMap): number[] {
  const buckets: number[][] = [[],[],[],[],[]]
  for (const q of questions as any[]) {
    const v = ans[q.id]
    if (!v) continue
    if (q.type === 'bipolar') {
      const pct = toPercentRightFromBipolar(v)
      buckets[q.axis-1].push(pct)
    }
  }
  return buckets.map(arr => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : 50)
}

function calibrationBoost(ans: AnswerMap): Record<string, number> {
  // Small nudges based on 4 calibration likert questions (Q21..Q24): 1..7 => -1..+1
  const boost: Record<string, number> = {}
  const t = (v:number)=> ((v-4)/3) // -1..+1
  const q21 = ans['Q21'] ? t(ans['Q21']) : 0
  const q22 = ans['Q22'] ? t(ans['Q22']) : 0
  const q23 = ans['Q23'] ? t(ans['Q23']) : 0
  const q24 = ans['Q24'] ? t(ans['Q24']) : 0

  // analytic
  boost['ANL'] = 4 * q21
  // critical theory / marxist
  boost['CRT'] = 4 * q22
  // phenomenology
  boost['PHE'] = 4 * q23
  // genealogical
  boost['GEN'] = 4 * q24

  return boost
}

export function computeScores(ans: AnswerMap) {
  const user = computeUserVec(ans)
  const boost = calibrationBoost(ans)

  const sims: { id: SchoolId, name: string, score: number }[] = []
  for (const id of Object.keys(ideals) as SchoolId[]) {
    const base = similarity(user, (ideals as any)[id])
    const add = boost[id] ?? 0
    const score = Math.max(0, Math.min(100, base + add))
    sims.push({ id, name: schoolName(id), score })
  }
  sims.sort((a,b)=>b.score-a.score)

  const main = sims[0]
  const second = sims[1]
  const hasSecond = second.score >= main.score*0.85 || (main.score - second.score) <= 6

  const neighborList = (neighbors as any)[main.id] as string[] | undefined
  const neighbor = neighborList?.length ? neighborList[0] : sims[1].id

  return {
    userVec: user,
    sims,
    main: main,
    second: hasSecond ? second : null,
    neighborId: neighbor,
  }
}

export function getSchool(id: string) {
  return (schools as any[]).find(x=>x.id===id)
}

export function getNeighborDiff(mainId: string, neighborId: string) {
  const a = getSchool(mainId)
  const b = getSchool(neighborId)
  if (!a || !b) return null
  // Use claims/opposes/methods to craft differences in plain language.
  return {
    mainName: a.name,
    neighborName: b.name,
    mainFocus: [
      ...a.claims.slice(0,2),
      ...a.methods.slice(0,1),
    ].slice(0,3),
    neighborFocus: [
      ...b.claims.slice(0,2),
      ...b.methods.slice(0,1),
    ].slice(0,3),
  }
}
