export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">ParkGolfFinder</p>
        <h1>파크골프 시설 찾기</h1>
        <p className="lede">검색 / 필터로 후보를 좁히고 목록 / 상세에서 빠르게 확인합니다.</p>
      </header>

      <section className="panel-grid" aria-label="ParkGolfFinder overview">
        <aside className="panel">
          <div className="panel-heading">
            <h2>검색 / 필터</h2>
            <p>시설명, 권역, 거리, 경로우대 조건</p>
          </div>

          <div className="stack">
            <div className="placeholder-row">
              <span>시설명</span>
              <span>지역</span>
              <span>거리</span>
            </div>
            <div className="placeholder-card">
              <strong>필터 상태</strong>
              <p>아직 데이터 연결 전입니다. 다음 단계에서 검색 입력과 조건 선택이 연결됩니다.</p>
            </div>
          </div>
        </aside>

        <section className="panel">
          <div className="panel-heading">
            <h2>목록 / 상세</h2>
            <p>거리 순 목록과 선택한 시설의 상세 패널</p>
          </div>

          <div className="stack">
            <div className="result-card">
              <div>
                <strong>목록 영역</strong>
                <p>시설 카드들이 이곳에 렌더링됩니다.</p>
              </div>
              <span className="badge">정적 셸</span>
            </div>
            <div className="detail-card">
              <strong>상세 영역</strong>
              <p>선택된 시설의 예약 방식, 이용 요금, 주소, 연락처가 표시됩니다.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
