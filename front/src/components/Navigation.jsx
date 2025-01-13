"use client"
import NavStyle from '../styles/nav.module.css'

const Navigation = () => {
  return (
    <div className={NavStyle.container}>
      <h1>B-yond</h1>
      <div>
        <span>예약확인</span>
        <button>로그인</button>
      </div>
    </div>
  )
}

export default Navigation