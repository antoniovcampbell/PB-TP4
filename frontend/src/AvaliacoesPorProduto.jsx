import { useCallback, useEffect, useState } from 'react'

const API = '/api/avaliacoes'

function AvaliacoesPorProduto({ produtoId, aberto = true }) {

  const [avaliacoes, setAvaliacoes] = useState([])
  const [media, setMedia] = useState(null)
  const [erro, setErro] = useState('')

  const [nomeUsuario, setNomeUsuario] = useState('')
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')

  const carregarAvaliacoes = useCallback(async () => {
    const [lista, mediaResposta] = await Promise.all([
      fetch(`${API}/produtos/${produtoId}`),
      fetch(`${API}/produtos/${produtoId}/media`)
    ])

    const dados = await lista.json()
    const mediaDados = await mediaResposta.json()

    setAvaliacoes(dados)
    setMedia(mediaDados)
  }, [produtoId])

  useEffect(() => {
    if (!produtoId || !aberto) return

    let ativo = true

    Promise.all([
      fetch(`${API}/produtos/${produtoId}`),
      fetch(`${API}/produtos/${produtoId}/media`)
    ])
        .then(([lista, mediaResposta]) => Promise.all([lista.json(), mediaResposta.json()]))
        .then(([dados, mediaDados]) => {
          if (ativo) {
            setAvaliacoes(dados)
            setMedia(mediaDados)
          }
        })

    return () => {
      ativo = false
    }
  }, [produtoId, aberto])

  function formatarData(valor) {
    if (!valor) return ''

    return new Date(valor).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  async function salvarAvaliacao(e) {

    e.preventDefault()
    setErro('')

    const avaliacao = {
      produtoId,
      nomeUsuario,
      nota,
      comentario
    }

    const resposta = await fetch(`${API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(avaliacao)
    })

    if (!resposta.ok) {
      setErro('Não foi possível salvar a avaliação. Verifique se o produto existe no catálogo.')
      return
    }

    setNomeUsuario('')
    setNota(5)
    setComentario('')

    carregarAvaliacoes()
  }

  async function deletarAvaliacao(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    carregarAvaliacoes()
  }

  const mediaFormatada = media && media.total > 0
      ? `${media.media.toLocaleString('pt-BR')} / 5 (${media.total} avaliações)`
      : 'Sem avaliações'

  return (
      <div className="avaliacoes">

        <div className="avaliacoes-header">
          <div>
            <h3>Avaliações</h3>
            <p className="avaliacoes-subtitulo">Notas e comentários vinculados a este produto.</p>
          </div>
          <span className="media">★ {mediaFormatada}</span>
        </div>

        {erro && <p className="erro">{erro}</p>}

        <form onSubmit={salvarAvaliacao} className="avaliacoes-form">

          <div className="campo">
            <input
                type="text"
                placeholder="Seu nome"
                value={nomeUsuario}
                onChange={(e) => setNomeUsuario(e.target.value)}
                required
            />
          </div>

          <div className="campo">
            <select value={nota} onChange={(e) => setNota(Number(e.target.value))}>
              <option value={5}>5 - Excelente</option>
              <option value={4}>4 - Bom</option>
              <option value={3}>3 - Regular</option>
              <option value={2}>2 - Ruim</option>
              <option value={1}>1 - Péssimo</option>
            </select>
          </div>

          <div className="campo campo-full">
            <textarea
                placeholder="Comentário (opcional)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-avaliar">Avaliar</button>
        </form>

        <div className="lista-avaliacoes">
          {
            avaliacoes.length === 0
                ? <p className="sem-avaliacao">Nenhuma avaliação ainda.</p>
                : avaliacoes.map(avaliacao => (
                     <div className="avaliacao" key={avaliacao.id}>
                       <div className="avaliacao-cabecalho">
                         <div>
                           <strong>{avaliacao.nomeUsuario}</strong>
                           <p className="avaliacao-data">{formatarData(avaliacao.dataCriacao)}</p>
                         </div>
                         <span className="estrelas">{'★'.repeat(avaliacao.nota)}{'☆'.repeat(5 - avaliacao.nota)}</span>
                       </div>
                       {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                       <button type="button" className="btn-remover" onClick={() => deletarAvaliacao(avaliacao.id)}>
                         Remover
                       </button>
                    </div>
                ))
          }
        </div>

      </div>
  )
}

export default AvaliacoesPorProduto
