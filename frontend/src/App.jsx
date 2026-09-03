import { useCallback, useEffect, useState } from 'react'
import AvaliacoesPorProduto from './AvaliacoesPorProduto'
import './App.css'

const PRODUTOS_API = '/api/produtos'
const ORDENACOES = {
  recente: 'Mais recentes',
  nome: 'Nome A-Z',
  maiorPreco: 'Maior preço',
  menorPreco: 'Menor preço'
}

function App() {

  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('recente')

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [erro, setErro] = useState('')

  const [editandoId, setEditandoId] = useState(null)
  const [avaliacoesAbertas, setAvaliacoesAbertas] = useState({})

  const carregarProdutos = useCallback(async (termoBusca = '') => {
    try {
      setErro('')
      const termo = termoBusca.trim()
      const url = termo
          ? `${PRODUTOS_API}/busca?termo=${encodeURIComponent(termo)}`
          : PRODUTOS_API

      const resposta = await fetch(url)

      if (!resposta.ok) {
        throw new Error('Falha ao carregar produtos')
      }

      const dados = await resposta.json()
      setProdutos(dados)
    } catch {
      setErro('Nao foi possivel carregar os produtos do backend.')
    }
  }, [])

  const produtosFiltrados = produtos
      .filter((produto) => {
        const termo = busca.trim().toLowerCase()

        if (!termo) return true

        return [produto.nome, produto.descricao]
            .filter(Boolean)
            .some((campo) => String(campo).toLowerCase().includes(termo))
      })
      .sort((a, b) => {
        if (ordenacao === 'nome') return a.nome.localeCompare(b.nome)
        if (ordenacao === 'maiorPreco') return Number(b.preco) - Number(a.preco)
        if (ordenacao === 'menorPreco') return Number(a.preco) - Number(b.preco)
        return Number(b.id) - Number(a.id)
      })

  useEffect(() => {
    carregarProdutos(busca)
  }, [busca, carregarProdutos])

  async function salvarProduto(e) {

    e.preventDefault()
    setErro('')

    const produto = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: Number(preco)
    }

    // EDITAR
    if (editandoId !== null) {

      const resposta = await fetch(`${PRODUTOS_API}/${editandoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
      })

      if (!resposta.ok) {
        const detalhe = await resposta.text()
        setErro(`Nao foi possivel atualizar o produto. ${detalhe}`.trim())
        return
      }

      setEditandoId(null)
      setBusca('')

    } else {

      // CADASTRAR
      const resposta = await fetch(PRODUTOS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
      })

      if (!resposta.ok) {
        const detalhe = await resposta.text()
        setErro(`Nao foi possivel cadastrar o produto. ${detalhe}`.trim())
        return
      }
      setBusca('')
    }

    limparFormulario()
    await carregarProdutos(busca)
  }

  function editarProduto(produto) {

    setNome(produto.nome)
    setDescricao(produto.descricao)
    setPreco(produto.preco)

    setEditandoId(produto.id)
  }

  function duplicarProduto(produto) {
    setNome(`${produto.nome} (cópia)`)
    setDescricao(produto.descricao)
    setPreco(produto.preco)
    setEditandoId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function copiarIdProduto(id) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(id))
      }
    } catch {
      // Ignora falha de clipboard em ambientes sem permissão.
    }
  }

  async function deletarProduto(id) {

    setErro('')

    const resposta = await fetch(`${PRODUTOS_API}/${id}`, {
      method: 'DELETE'
    })

    if (!resposta.ok && resposta.status !== 204) {
      setErro('Nao foi possivel excluir o produto.')
      return
    }

    await carregarProdutos(busca)

  }

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setPreco('')
  }

  function cancelarEdicao() {
    limparFormulario()
    setEditandoId(null)
  }

  function limparBusca() {
    setBusca('')
    carregarProdutos('')
  }

  function alternarAvaliacoes(id) {
    setAvaliacoesAbertas((atual) => ({
      ...atual,
      [id]: atual[id] === false
    }))
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (

      <div className="container">

        <header className="app-header">
          <div className="hero-badge">Painel de catálogo</div>
          <h1>Catálogo de Produtos</h1>
          <p className="subtitulo">Gerencie produtos, compare preços e acompanhe avaliações em tempo real.</p>

          {erro && <p className="erro erro-compacto">{erro}</p>}

          <div className="painel-resumo">
            <div className="resumo-card">
              <span className="resumo-label">Total</span>
              <strong>{produtos.length}</strong>
            </div>
            <div className="resumo-card">
              <span className="resumo-label">Filtrados</span>
              <strong>{produtosFiltrados.length}</strong>
            </div>
            <div className="resumo-card">
              <span className="resumo-label">Ordenação</span>
              <strong>{ORDENACOES[ordenacao]}</strong>
            </div>
          </div>
        </header>

        <section className="form-card">
          <div className="form-topo">
            <h2 className="form-titulo">
              {editandoId !== null ? `Editar produto #${editandoId}` : 'Novo produto'}
            </h2>

            <div className="form-toolbar">
              <div className="campo campo-toolbar">
                <label htmlFor="busca">Buscar</label>
                <input
                    id="busca"
                    type="search"
                    placeholder="Nome ou descrição"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <div className="campo campo-toolbar">
                <label htmlFor="ordenacao">Ordenar por</label>
                <select
                    id="ordenacao"
                    value={ordenacao}
                    onChange={(e) => setOrdenacao(e.target.value)}
                >
                  <option value="recente">Mais recentes</option>
                  <option value="nome">Nome A-Z</option>
                  <option value="maiorPreco">Maior preço</option>
                  <option value="menorPreco">Menor preço</option>
                </select>
              </div>

              <button type="button" className="btn btn-ghost" onClick={limparBusca}>
                Limpar busca
              </button>
            </div>
          </div>

          <form className="form-grid" onSubmit={salvarProduto}>

            <div className="campo">
              <label htmlFor="nome">Nome</label>
              <input
                  id="nome"
                  type="text"
                  placeholder="Ex.: Smartphone"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
              />
            </div>

            <div className="campo">
              <label htmlFor="descricao">Descrição</label>
              <input
                  id="descricao"
                  type="text"
                  placeholder="Ex.: Smartphone Android 128GB"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
              />
            </div>

            <div className="campo">
              <label htmlFor="preco">Preço</label>
              <input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
              />
            </div>

            <div className="form-acoes">
              {editandoId !== null && (
                  <button type="button" className="btn btn-secundario" onClick={cancelarEdicao}>
                    Cancelar
                  </button>
              )}
              <button type="submit" className="btn btn-primario">
                {editandoId !== null ? 'Atualizar produto' : 'Cadastrar produto'}
              </button>
            </div>

          </form>
        </section>

        <section className="lista-produtos">

          {
            produtosFiltrados.length === 0
                ? <p className="sem-produtos">Nenhum produto cadastrado ainda.</p>
                : produtosFiltrados.map(produto => (

                    <div className="card" key={produto.id}>

                      <div className="card-corpo">
                        <div className="card-meta">
                          <span className="chip chip-roxo">#{produto.id}</span>
                          <span className="chip chip-clarinho">Produto ativo</span>
                        </div>
                        <h2 className="card-titulo">{produto.nome}</h2>
                        <p className="card-descricao">{produto.descricao}</p>
                        <span className="card-preco">{formatarPreco(produto.preco)}</span>
                      </div>

                      <div className="card-acoes">
                        <button type="button" className="btn btn-editar" onClick={() => editarProduto(produto)}>
                          Editar
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => duplicarProduto(produto)}>
                          Duplicar
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => copiarIdProduto(produto.id)}>
                          Copiar ID
                        </button>
                        <button type="button" className="btn btn-deletar-produto" onClick={() => deletarProduto(produto.id)}>
                          Excluir
                        </button>
                      </div>

                      <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => alternarAvaliacoes(produto.id)}
                      >
                        {avaliacoesAbertas[produto.id] === false ? 'Ver avaliações' : 'Ocultar avaliações'}
                      </button>

                      {avaliacoesAbertas[produto.id] !== false && <AvaliacoesPorProduto produtoId={produto.id} aberto={avaliacoesAbertas[produto.id] !== false} />}

                    </div>
                ))
          }

        </section>

      </div>
  )
}

export default App
