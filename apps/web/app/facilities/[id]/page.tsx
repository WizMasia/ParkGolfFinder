type FacilityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FacilityPage({ params }: FacilityPageProps) {
  const { id } = await params;

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">Facility detail</p>
        <h1 style={{ margin: 0 }}>시설 상세</h1>
        <p className="lede">선택한 시설 ID를 기준으로 상세 정보를 붙일 자리입니다.</p>

        <div className="detail-card" style={{ marginTop: 20 }}>
          <strong>시설 ID</strong>
          <p>{id}</p>
        </div>

        <p style={{ marginTop: 20 }}>
          <a href="/">← 목록으로 돌아가기</a>
        </p>
      </section>
    </main>
  );
}
