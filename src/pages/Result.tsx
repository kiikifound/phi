import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button, Pill } from '../components/UI'
import { AXES, computeScores, getSchool, getNeighborDiff } from '../lib/scoring'
import ideals from '../data/ideals.json'
import { RadarChart, BarTop } from '../components/Charts'

function loadFinal() {
  try {
    const raw = localStorage.getItem('philo_answers_final') || localStorage.getItem('philo_answers')
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export default function Result() {
  const ans = useMemo(() => loadFinal(), [])
  const res = useMemo(() => computeScores(ans), [ans])
  const mainSchool = getSchool(res.main.id)
  const neighbor = getSchool(res.neighborId)
  const diff = getNeighborDiff(res.main.id, res.neighborId)

  const top5 = res.sims.slice(0,5).map(s=>({ name: s.name, score: Math.round(s.score) }))

  if (!mainSchool) {
    return (
      <div className="page">
        <Card>
          <div className="card__title">未找到结果</div>
          <div className="card__text">请先完成测试。</div>
          <Link to="/test"><Button>去测试</Button></Link>
        </Card>
      </div>
    )
  }

  const second = res.second ? getSchool(res.second.id) : null

  return (
    <div className="page">
      <div className="resulthead">
        <div>
          <div className="resulthead__title">你的哲学派别结果</div>
          <div className="resulthead__sub">先给派别定义，再给你的理解方式图谱。</div>
        </div>
        <div className="resulthead__badge">
          <Pill>主派别：{mainSchool.name}</Pill>
          {second ? <Pill>混合倾向：{second.name}</Pill> : <Pill>单一倾向</Pill>}
        </div>
      </div>

      {/* 1) School definition + narrative + figures + learning + daily */}
      <Card className="card--padded">
        <div className="section__kicker">理论谱系结果</div>
        <div className="section__title">{mainSchool.name}</div>
        <div className="section__text">{mainSchool.definition}</div>

        <div className="split2">
          <div>
            <div className="mini__title">主要主张</div>
            <ul className="list">
              {mainSchool.claims.map((x:string, i:number)=><li key={i}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="mini__title">通常反对</div>
            <ul className="list">
              {mainSchool.opposes.map((x:string, i:number)=><li key={i}>{x}</li>)}
            </ul>
          </div>
        </div>

        <div className="mini__title">你如何思考问题（叙述）</div>
        <div className="section__text">
          你的结果更接近这条谱系，通常意味着你在面对问题时，会优先采用该派别常用的“理解路径”：
          {mainSchool.methods.slice(0,3).map((m:string, i:number)=>(
            <div key={i} className="bulletline">• {m}</div>
          ))}
        </div>

        <div className="split2">
          <div>
            <div className="mini__title">代表人物与贡献</div>
            <div className="people">
              {mainSchool.figures.slice(0,3).map((p:any, i:number)=>(
                <div key={i} className="person">
                  <div className="person__name">{p.name}</div>
                  <div className="person__idea">{p.idea}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mini__title">如果想继续学习</div>
            <div className="learn">
              {mainSchool.learn.map((lv:any, i:number)=>(
                <div key={i} className="learn__block">
                  <div className="learn__level">{lv.level}</div>
                  <ul className="list">
                    {lv.items.map((it:string, j:number)=><li key={j}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mini__title">面对日常生活的态度与行动方式</div>
        <div className="dailygrid">
          {mainSchool.daily.map((d:any, i:number)=>(
            <div key={i} className="dailycard">
              <div className="dailycard__topic">{d.topic}</div>
              <div className="dailycard__text">{d.text}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2) Charts */}
      <div className="grid2">
        <Card className="card--padded">
          <div className="section__kicker">派别分布</div>
          <div className="section__title">你与各派别的接近程度</div>
          <BarTop items={top5} />
        </Card>

        <Card className="card--padded">
          <div className="section__kicker">理解方式图谱</div>
          <div className="section__title">你的思考路径（雷达图）</div>
          <RadarChart
            axes={AXES}
            user={res.userVec}
            ideal={(ideals as any)[res.main.id]}
            second={neighbor ? { name: neighbor.name, vec: (ideals as any)[neighbor.id] } : null}
          />
        </Card>
      </div>

      {/* 3) Neighbor difference (stance/method, not dimension) */}
      {neighbor && diff && (
        <Card className="card--padded">
          <div className="section__kicker">临近派别</div>
          <div className="section__title">你也接近：{neighbor.name}</div>
          <div className="section__text">
            这意味着：在某些问题上，你的理解方式与该派别也能对上号。下面是两者常见的侧重点差异（用主张与做法来表达）。
          </div>

          <div className="split2">
            <div>
              <div className="mini__title">{diff.mainName}更常强调</div>
              <ul className="list">
                {diff.mainFocus.map((x:string, i:number)=><li key={i}>{x}</li>)}
              </ul>
            </div>
            <div>
              <div className="mini__title">{diff.neighborName}更常强调</div>
              <ul className="list">
                {diff.neighborFocus.map((x:string, i:number)=><li key={i}>{x}</li>)}
              </ul>
            </div>
          </div>

          <div className="section__text">
            如果你想进一步区分两者：可以回看你在“用词/论证是否清晰”“是否需要统一框架”“对普遍解释的耐心”等题上的直觉偏好。
          </div>
        </Card>
      )}

      {/* 4) Practical tilt */}
      <Card className="card--padded">
        <div className="section__kicker">现实取向补充</div>
        <div className="section__title">在日常议题里，你更可能倾向于</div>
        <ul className="list">
          <li>当解释冲突时，优先用你更信任的“证据/论证方式”来裁决，而不是看立场热度。</li>
          <li>面对复杂问题，更倾向先把问题拆清楚，再决定是否需要行动或站队。</li>
          <li>更容易对“唯一正确答案”保持谨慎，并注意叙事与权威如何塑造讨论。</li>
        </ul>
      </Card>

      <div className="actions">
        <Link to="/test"><Button variant="ghost">再测一次</Button></Link>
        <Link to="/schools"><Button>查看派别百科</Button></Link>
      </div>
    </div>
  )
}
