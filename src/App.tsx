import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import Result from './pages/Result'
import Schools from './pages/Schools'
import SchoolDetail from './pages/SchoolDetail'
import { Container, Nav } from './components/Layout'

function TopBar() {
  const loc = useLocation()
  return (
    <div className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="brand">
          <span className="brand__dot" />
          <span className="brand__name">哲学派别测试</span>
        </Link>
        <Nav>
          <Link className={loc.pathname==='/test'?'active':''} to="/test">开始测试</Link>
          <Link className={loc.pathname.startsWith('/schools')?'active':''} to="/schools">派别百科</Link>
        </Nav>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <TopBar />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/schools/:id" element={<SchoolDetail />} />
        </Routes>
      </Container>
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__fine">
            说明：本测试用于呈现“理解问题的习惯路径”，不等同于能力或价值判断。
          </div>
        </div>
      </footer>
    </>
  )
}
