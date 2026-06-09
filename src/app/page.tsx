'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { formatUnits, parseUnits } from 'viem'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'

import {
  tokenAddress,
  nftAddress,
  marketplaceAddress,
  tokenABI,
  nftABI,
  marketplaceABI,
} from './contracts'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const [approveAmount, setApproveAmount] = useState('')
  const [mintUri, setMintUri] = useState('')
  const [uriTokenId, setUriTokenId] = useState('')

  const [approveTokenId, setApproveTokenId] = useState('')
  const [listTokenId, setListTokenId] = useState('')
  const [listPrice, setListPrice] = useState('')

  const [buyTokenId, setBuyTokenId] = useState('')
  const [cancelTokenId, setCancelTokenId] = useState('')
  const [listingTokenId, setListingTokenId] = useState('')

  const { data: tokenName } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: 'name',
  })

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: 'symbol',
  })

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: 'balanceOf',
    args: mounted && address ? [address] : undefined,
    query: {
      enabled: mounted && !!address,
    },
  })

  const { data: nftName } = useReadContract({
    address: nftAddress,
    abi: nftABI,
    functionName: 'name',
  })

  const { data: nftBalance } = useReadContract({
    address: nftAddress,
    abi: nftABI,
    functionName: 'balanceOf',
    args: mounted && address ? [address] : undefined,
    query: {
      enabled: mounted && !!address,
    },
  })

  const { data: tokenUriData } = useReadContract({
    address: nftAddress,
    abi: nftABI,
    functionName: 'tokenURI',
    args: uriTokenId !== '' ? [BigInt(uriTokenId)] : undefined,
    query: {
      enabled: uriTokenId !== '',
    },
  })

  const { data: listingData } = useReadContract({
    address: marketplaceAddress,
    abi: marketplaceABI,
    functionName: 'getListing',
    args: listingTokenId !== '' ? [BigInt(listingTokenId)] : undefined,
    query: {
      enabled: listingTokenId !== '',
    },
  })

  const handleApproveToken = () => {
    if (approveAmount === '') {
      alert('승인할 토큰 수량을 입력하세요.')
      return
    }

    writeContract({
      address: tokenAddress,
      abi: tokenABI,
      functionName: 'approve',
      args: [marketplaceAddress, parseUnits(approveAmount, 18)],
    })
  }

  const handleMintNFT = () => {
    if (!mounted || !address) {
      alert('지갑을 먼저 연결하세요.')
      return
    }

    if (mintUri === '') {
      alert('NFT URI를 입력하세요.')
      return
    }

    writeContract({
      address: nftAddress,
      abi: nftABI,
      functionName: 'safeMint',
      args: [address, mintUri],
    })
  }

  const handleApproveNFT = () => {
    if (approveTokenId === '') {
      alert('승인할 NFT Token ID를 입력하세요.')
      return
    }

    writeContract({
      address: nftAddress,
      abi: nftABI,
      functionName: 'approve',
      args: [marketplaceAddress, BigInt(approveTokenId)],
    })
  }

  const handleListNFT = () => {
    if (listTokenId === '' || listPrice === '') {
      alert('Token ID와 판매 가격을 모두 입력하세요.')
      return
    }

    writeContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'listNFT',
      args: [BigInt(listTokenId), parseUnits(listPrice, 18)],
    })
  }

  const handleBuyNFT = () => {
    if (buyTokenId === '') {
      alert('구매할 NFT Token ID를 입력하세요.')
      return
    }

    writeContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'buyNFT',
      args: [BigInt(buyTokenId)],
    })
  }

  const handleCancelListing = () => {
    if (cancelTokenId === '') {
      alert('취소할 NFT Token ID를 입력하세요.')
      return
    }

    writeContract({
      address: marketplaceAddress,
      abi: marketplaceABI,
      functionName: 'cancelListing',
      args: [BigInt(cancelTokenId)],
    })
  }

  return (
    <main style={pageStyle}>
      <div style={backgroundGlowOne} />
      <div style={backgroundGlowTwo} />

      <div style={containerStyle}>
        <section style={heroStyle}>
          <div>
            <div style={badgeStyle}>Web3 Marketplace Dashboard</div>
            <h1 style={heroTitle}>NFT Marketplace App</h1>
            <p style={heroDesc}>
              ERC-20 토큰, ERC-721 NFT, Marketplace 기능을 한 화면에서 관리할 수
              있는 대시보드입니다.
            </p>
          </div>

          <div style={heroStatusBox}>
            <p style={heroStatusLabel}>Wallet Status</p>

            <StatusPill
              text={
                !mounted
                  ? 'Loading'
                  : isConnected
                    ? 'Connected'
                    : 'Disconnected'
              }
              tone={!mounted ? 'neutral' : isConnected ? 'success' : 'neutral'}
            />

            <p style={addressText}>
              {!mounted
                ? '지갑 상태 확인 중'
                : address
                  ? shortenAddress(address)
                  : '지갑을 연결하세요'}
            </p>
          </div>
        </section>

        <section style={statsGrid}>
          <InfoCard
            title='Token'
            value={String(tokenName ?? '-')}
            sub={String(tokenSymbol ?? '-')}
          />

          <InfoCard
            title='My Token Balance'
            value={
              !mounted
                ? '-'
                : tokenBalance !== undefined
                  ? formatUnits(tokenBalance, 18)
                  : '-'
            }
            sub={!mounted ? '-' : String(tokenSymbol ?? '')}
          />

          <InfoCard
            title='NFT Collection'
            value={String(nftName ?? '-')}
            sub='ERC-721'
          />

          <InfoCard
            title='My NFT Count'
            value={!mounted ? '-' : (nftBalance?.toString() ?? '-')}
            sub='Owned NFTs'
          />
        </section>

        <section style={sectionGrid}>
          <DashboardCard
            title='1. ERC-20 Token'
            subtitle='토큰 잔액 확인 및 마켓플레이스 결제 승인'
          >
            <ActionBlock
              title='마켓플레이스 결제 승인'
              description='구매를 위해 Marketplace 컨트랙트가 토큰을 사용할 수 있도록 승인합니다.'
            >
              <input
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
                placeholder='예: 100'
                style={inputStyle}
              />

              <button onClick={handleApproveToken} style={primaryButtonStyle}>
                ERC-20 결제 승인
              </button>
            </ActionBlock>
          </DashboardCard>

          <DashboardCard
            title='2. ERC-721 NFT'
            subtitle='NFT 발행, URI 조회, 판매 승인'
          >
            <ActionBlock
              title='NFT 발행'
              description='새 NFT를 발행합니다. tokenURI 값은 메타데이터 주소입니다.'
            >
              <input
                value={mintUri}
                onChange={(e) => setMintUri(e.target.value)}
                placeholder='NFT URI 입력'
                style={inputStyle}
              />

              <button onClick={handleMintNFT} style={primaryButtonStyle}>
                NFT 발행
              </button>
            </ActionBlock>

            <ActionBlock
              title='NFT URI 조회'
              description='발행된 Token ID를 입력하면 URI를 조회할 수 있습니다.'
            >
              <input
                value={uriTokenId}
                onChange={(e) => setUriTokenId(e.target.value)}
                placeholder='조회할 Token ID'
                style={inputStyle}
              />

              <div style={resultBoxStyle}>
                <span style={resultLabelStyle}>조회 결과</span>
                <p style={resultTextStyle}>{String(tokenUriData ?? '-')}</p>
              </div>
            </ActionBlock>

            <ActionBlock
              title='NFT 판매 권한 승인'
              description='Marketplace가 해당 NFT를 판매 처리할 수 있도록 권한을 부여합니다.'
            >
              <input
                value={approveTokenId}
                onChange={(e) => setApproveTokenId(e.target.value)}
                placeholder='승인할 Token ID'
                style={inputStyle}
              />

              <button onClick={handleApproveNFT} style={primaryButtonStyle}>
                NFT 판매 승인
              </button>
            </ActionBlock>
          </DashboardCard>

          <DashboardCard
            title='3. Marketplace'
            subtitle='판매 등록, 구매, 취소, 판매정보 조회'
          >
            <ActionBlock
              title='NFT 판매 등록'
              description='판매할 NFT와 가격을 입력해 마켓에 등록합니다.'
            >
              <input
                value={listTokenId}
                onChange={(e) => setListTokenId(e.target.value)}
                placeholder='판매할 Token ID'
                style={inputStyle}
              />

              <input
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder='판매 가격 예: 10'
                style={inputStyle}
              />

              <button onClick={handleListNFT} style={primaryButtonStyle}>
                NFT 판매 등록
              </button>
            </ActionBlock>

            <ActionBlock
              title='NFT 구매'
              description='구매할 Token ID를 입력하여 구매를 실행합니다.'
            >
              <input
                value={buyTokenId}
                onChange={(e) => setBuyTokenId(e.target.value)}
                placeholder='구매할 Token ID'
                style={inputStyle}
              />

              <button onClick={handleBuyNFT} style={primaryButtonStyle}>
                NFT 구매
              </button>
            </ActionBlock>

            <ActionBlock
              title='판매 등록 취소'
              description='현재 판매 중인 NFT 등록을 취소합니다.'
            >
              <input
                value={cancelTokenId}
                onChange={(e) => setCancelTokenId(e.target.value)}
                placeholder='취소할 Token ID'
                style={inputStyle}
              />

              <button
                onClick={handleCancelListing}
                style={secondaryButtonStyle}
              >
                판매 등록 취소
              </button>
            </ActionBlock>

            <ActionBlock
              title='판매 정보 조회'
              description='특정 NFT의 판매 가격, 판매자, 상태를 조회합니다.'
            >
              <input
                value={listingTokenId}
                onChange={(e) => setListingTokenId(e.target.value)}
                placeholder='조회할 Token ID'
                style={inputStyle}
              />

              <div style={resultBoxStyle}>
                <span style={resultLabelStyle}>Listing Info</span>

                {listingData ? (
                  <div style={listingInfoStyle}>
                    <p>
                      <strong>판매 가격</strong>:{' '}
                      {formatUnits(listingData[0], 18)} Token
                    </p>
                    <p>
                      <strong>판매자</strong>: {String(listingData[1])}
                    </p>
                    <p>
                      <strong>판매 상태</strong>:{' '}
                      {listingData[2] ? '판매 중' : '판매 아님'}
                    </p>
                  </div>
                ) : (
                  <p style={resultTextStyle}>
                    판매 정보를 조회할 Token ID를 입력하세요.
                  </p>
                )}
              </div>
            </ActionBlock>
          </DashboardCard>

          <DashboardCard
            title='Transaction Status'
            subtitle='현재 트랜잭션 처리 상태'
          >
            <div style={statusListStyle}>
              <StatusRow
                label='지갑 확인 필요'
                value={isPending ? '진행 중' : '대기'}
                tone={isPending ? 'warning' : 'neutral'}
              />

              <StatusRow
                label='블록 확인'
                value={isConfirming ? '확인 중' : '대기'}
                tone={isConfirming ? 'warning' : 'neutral'}
              />

              <StatusRow
                label='트랜잭션 결과'
                value={isSuccess ? '성공' : '미완료'}
                tone={isSuccess ? 'success' : 'neutral'}
              />
            </div>

            <div style={resultBoxStyle}>
              <span style={resultLabelStyle}>Transaction Hash</span>
              <p style={resultTextStyle}>{hash ?? '-'}</p>
            </div>

            <div style={errorBoxStyle}>
              <span style={errorLabelStyle}>Error Message</span>
              <p style={errorTextStyle}>{error ? error.message : '-'}</p>
            </div>
          </DashboardCard>
        </section>
      </div>
    </main>
  )
}

function InfoCard({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub: string
}) {
  return (
    <div style={infoCardStyle}>
      <p style={infoCardTitle}>{title}</p>
      <p style={infoCardValue}>{value}</p>
      <p style={infoCardSub}>{sub}</p>
    </div>
  )
}

function DashboardCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section style={dashboardCardStyle}>
      <div style={cardHeaderStyle}>
        <h2 style={cardTitleStyle}>{title}</h2>
        <p style={cardSubtitleStyle}>{subtitle}</p>
      </div>

      <div style={cardBodyStyle}>{children}</div>
    </section>
  )
}

function ActionBlock({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div style={actionBlockStyle}>
      <h3 style={actionTitleStyle}>{title}</h3>
      <p style={actionDescStyle}>{description}</p>

      <div style={actionContentStyle}>{children}</div>
    </div>
  )
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'neutral'
}) {
  return (
    <div style={statusRowStyle}>
      <span style={statusRowLabelStyle}>{label}</span>
      <StatusPill text={value} tone={tone} />
    </div>
  )
}

function StatusPill({
  text,
  tone,
}: {
  text: string
  tone: 'success' | 'warning' | 'neutral'
}) {
  const toneStyle =
    tone === 'success'
      ? statusSuccessStyle
      : tone === 'warning'
        ? statusWarningStyle
        : statusNeutralStyle

  return <span style={{ ...statusPillStyle, ...toneStyle }}>{text}</span>
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at top, #1e293b 0%, #0f172a 35%, #020617 100%)',
  padding: '40px 20px 80px',
  color: '#e5eefb',
}

const containerStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
}

const backgroundGlowOne: CSSProperties = {
  position: 'absolute',
  top: '-120px',
  left: '-80px',
  width: '320px',
  height: '320px',
  borderRadius: '999px',
  background: 'rgba(99, 102, 241, 0.25)',
  filter: 'blur(60px)',
}

const backgroundGlowTwo: CSSProperties = {
  position: 'absolute',
  right: '-100px',
  top: '180px',
  width: '300px',
  height: '300px',
  borderRadius: '999px',
  background: 'rgba(16, 185, 129, 0.18)',
  filter: 'blur(70px)',
}

const heroStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  alignItems: 'center',
  padding: '28px',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(18px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  marginBottom: '24px',
  flexWrap: 'wrap',
}

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(99, 102, 241, 0.18)',
  border: '1px solid rgba(129, 140, 248, 0.35)',
  fontSize: '12px',
  fontWeight: 700,
  color: '#c7d2fe',
  marginBottom: '14px',
}

const heroTitle: CSSProperties = {
  margin: 0,
  fontSize: '40px',
  fontWeight: 800,
  letterSpacing: '-0.03em',
}

const heroDesc: CSSProperties = {
  marginTop: '12px',
  marginBottom: 0,
  maxWidth: '680px',
  color: '#cbd5e1',
  fontSize: '15px',
  lineHeight: 1.7,
}

const heroStatusBox: CSSProperties = {
  minWidth: '260px',
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(15,23,42,0.45)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const heroStatusLabel: CSSProperties = {
  margin: '0 0 10px 0',
  color: '#94a3b8',
  fontSize: '13px',
}

const addressText: CSSProperties = {
  marginTop: '12px',
  fontSize: '14px',
  color: '#e2e8f0',
  wordBreak: 'break-all',
}

const statsGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
  marginBottom: '24px',
}

const infoCardStyle: CSSProperties = {
  padding: '20px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
}

const infoCardTitle: CSSProperties = {
  margin: 0,
  color: '#94a3b8',
  fontSize: '13px',
}

const infoCardValue: CSSProperties = {
  margin: '8px 0 4px 0',
  fontSize: '28px',
  fontWeight: 800,
  color: '#f8fafc',
}

const infoCardSub: CSSProperties = {
  margin: 0,
  color: '#cbd5e1',
  fontSize: '14px',
}

const sectionGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '20px',
}

const dashboardCardStyle: CSSProperties = {
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
  overflow: 'hidden',
}

const cardHeaderStyle: CSSProperties = {
  padding: '22px 24px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '22px',
  fontWeight: 800,
  color: '#f8fafc',
}

const cardSubtitleStyle: CSSProperties = {
  margin: '8px 0 0 0',
  color: '#cbd5e1',
  fontSize: '14px',
}

const cardBodyStyle: CSSProperties = {
  padding: '22px 24px 24px',
}

const actionBlockStyle: CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(15,23,42,0.42)',
  border: '1px solid rgba(255,255,255,0.06)',
  marginBottom: '16px',
}

const actionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '17px',
  fontWeight: 700,
  color: '#f8fafc',
}

const actionDescStyle: CSSProperties = {
  margin: '8px 0 16px 0',
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: 1.6,
}

const actionContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.12)',
  outline: 'none',
  background: 'rgba(255,255,255,0.06)',
  color: '#f8fafc',
  fontSize: '14px',
  boxSizing: 'border-box',
}

const primaryButtonStyle: CSSProperties = {
  padding: '14px 18px',
  borderRadius: '14px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 700,
  color: '#ffffff',
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  boxShadow: '0 10px 24px rgba(99,102,241,0.28)',
}

const secondaryButtonStyle: CSSProperties = {
  padding: '14px 18px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.12)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 700,
  color: '#e2e8f0',
  background: 'rgba(255,255,255,0.05)',
}

const resultBoxStyle: CSSProperties = {
  marginTop: '2px',
  padding: '14px 16px',
  borderRadius: '14px',
  background: 'rgba(2,6,23,0.45)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const resultLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#94a3b8',
  marginBottom: '8px',
}

const resultTextStyle: CSSProperties = {
  margin: 0,
  color: '#e2e8f0',
  wordBreak: 'break-all',
  lineHeight: 1.6,
}

const listingInfoStyle: CSSProperties = {
  color: '#e2e8f0',
  lineHeight: 1.8,
  wordBreak: 'break-all',
}

const statusListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '18px',
}

const statusRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: '14px',
  background: 'rgba(15,23,42,0.42)',
  border: '1px solid rgba(255,255,255,0.06)',
}

const statusRowLabelStyle: CSSProperties = {
  color: '#e2e8f0',
  fontSize: '14px',
  fontWeight: 600,
}

const statusPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
}

const statusSuccessStyle: CSSProperties = {
  background: 'rgba(16,185,129,0.18)',
  color: '#6ee7b7',
  border: '1px solid rgba(16,185,129,0.3)',
}

const statusWarningStyle: CSSProperties = {
  background: 'rgba(245,158,11,0.18)',
  color: '#fcd34d',
  border: '1px solid rgba(245,158,11,0.3)',
}

const statusNeutralStyle: CSSProperties = {
  background: 'rgba(148,163,184,0.18)',
  color: '#cbd5e1',
  border: '1px solid rgba(148,163,184,0.2)',
}

const errorBoxStyle: CSSProperties = {
  marginTop: '16px',
  padding: '14px 16px',
  borderRadius: '14px',
  background: 'rgba(127,29,29,0.18)',
  border: '1px solid rgba(248,113,113,0.2)',
}

const errorLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#fca5a5',
  marginBottom: '8px',
}

const errorTextStyle: CSSProperties = {
  margin: 0,
  color: '#fecaca',
  wordBreak: 'break-all',
  lineHeight: 1.6,
}
