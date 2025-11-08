import { useState, useEffect } from 'react'
import ApiService from '../services/api'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

/**
 * Página de gerenciamento de funcionários
 */
const FuncionariosPage = () => {
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    cargo: ''
  })

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const fetchFuncionarios = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getAllFuncionarios()
      setFuncionarios(response.funcionarios || [])
    } catch (err) {
      setError('Erro ao carregar funcionários: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Aplicar máscara de CPF
    if (name === 'cpf') {
      const numericValue = value.replace(/\D/g, '')
      let maskedValue = numericValue
      
      if (numericValue.length <= 11) {
        maskedValue = numericValue
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: maskedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        await ApiService.updateFuncionario(editingId, {
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo
        })
      } else {
        await ApiService.addFuncionario(formData)
      }

      setFormData({ nome: '', email: '', cpf: '', cargo: '' })
      setShowForm(false)
      setEditingId(null)
      fetchFuncionarios()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (funcionario) => {
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      cpf: funcionario.cpf,
      cargo: funcionario.cargo
    })
    setEditingId(funcionario._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este funcionário?')) {
      return
    }

    try {
      await ApiService.deleteFuncionario(id)
      fetchFuncionarios()
    } catch (err) {
      setError('Erro ao desativar funcionário: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-neutral-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          Gerenciamento de Funcionários
        </h1>
        <Button
          onClick={() => {
            setEditingId(null)
            setFormData({ nome: '', email: '', cpf: '', cargo: '' })
            setShowForm(!showForm)
          }}
          variant="primary"
        >
          + Adicionar Funcionário
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg border border-neutral-200">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nome
                </label>
                <Input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    CPF
                  </label>
                  <Input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength="14"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Cargo
                </label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                  required
                >
                  <option value="">Selecione uma opção</option>
                  <option value="garcom">Garçom</option>
                  <option value="cozinheiro">Cozinheiro</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {funcionarios.map(funcionario => (
          <div
            key={funcionario._id}
            className="p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-neutral-900">{funcionario.nome}</h3>
                <p className="text-sm text-neutral-600">{funcionario.email}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Cargo: <span className="font-medium">{funcionario.cargo}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(funcionario)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(funcionario._id)}
                >
                  Desativar
                </Button>
              </div>
            </div>
          </div>
        ))}

        {funcionarios.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-neutral-500">Nenhum funcionário cadastrado</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FuncionariosPage
