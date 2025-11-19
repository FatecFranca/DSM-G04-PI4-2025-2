import { useState, useEffect } from "react";
import StatCard from "../components/charts/StatCard";
import BarChart from "../components/charts/BarChart";
import PieChart from "../components/charts/PieChart";
import LineChart from "../components/charts/LineChart";
import ApiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AdminPage = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'users', 'mesas', 'cardapio', 'chamados', 'perfil'
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { user, logout } = useAuth();

  // Estados para dados do backend
  const [funcionarios, setFuncionarios] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [chamados, setChamados] = useState([]);
  const [cardapios, setCardapios] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // (Relatórios removidos: os dados de relatório agora são acessíveis pelo Dashboard principal)

  // Estados para modal de cadastro de mesa
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [mesaForm, setMesaForm] = useState({
    numero: "",
    id_botao: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Estados para modal de cadastro de produto
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtoForm, setProdutoForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
  });

  // Estados para edição
  const [editingMesa, setEditingMesa] = useState(null);
  const [editingProduto, setEditingProduto] = useState(null);
  const [editingFuncionario, setEditingFuncionario] = useState(null);

  // Estados para modal de edição de empresa
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({
    nomeEmpresa: "",
    tipo: "",
  });

  // Estados para modal de edição de perfil do gerente
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [perfilForm, setPerfilForm] = useState({
    nome: "",
    email: "",
  });

  // Estados para modal de cadastro de funcionário
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  const [funcionarioForm, setFuncionarioForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    cargo: "",
  });

  // Carregar dados do backend
  useEffect(() => {
    loadData();
  }, []);

  // Relatórios removidos: carregamento específico por tab não é mais necessário

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [funcData, mesasData, chamadosData, cardapioData] =
        await Promise.all([
          ApiService.getAllFuncionarios().catch((err) => {
            console.error("❌ Erro ao carregar funcionários:", err);
            return { funcionarios: [] };
          }),
          ApiService.getAllMesas().catch((err) => {
            console.error("❌ Erro ao carregar mesas:", err);
            return { mesas: [] };
          }),
          ApiService.getAllChamados().catch((err) => {
            console.error("❌ Erro ao carregar chamados:", err);
            return { chamados: [] };
          }),
          ApiService.getAllCardapios().catch((err) => {
            console.error("❌ Erro ao carregar cardápios:", err);
            return { itens: [] };
          }),
        ]);

      const funcionariosArray = funcData.funcionarios || funcData.users || [];
      const mesasArray = mesasData.mesas || [];
      const chamadosArray = chamadosData.chamados || [];

      // O backend pode retornar array direto ou objeto { itens: [], cardapios: [] }
      let cardapiosArray = [];
      if (Array.isArray(cardapioData)) {
        cardapiosArray = cardapioData;
      } else {
        cardapiosArray = cardapioData.itens || cardapioData.cardapios || [];
      }

      setFuncionarios(funcionariosArray);
      setMesas(mesasArray);
      setChamados(chamadosArray);
      setCardapios(cardapiosArray);

      // Tentar carregar dados da empresa
      if (user?.empresa) {
        try {
          const empresaData = await ApiService.getEmpresa();
          setEmpresa(empresaData.empresa);
        } catch (err) {
          console.log("⚠️ Erro ao carregar empresa:", err);
        }
      }
    } catch (err) {
      console.error("❌ Erro geral ao carregar dados:", err);
      setError("Erro ao carregar dados do sistema");
    } finally {
      setLoading(false);
    }
  };

  // Função de relatórios removida — relatórios são tratados na página Dashboard

  // Calcular estatísticas dos dados reais
  const stats = {
    totalUsers: funcionarios.length,
    totalMesas: mesas.length,
    mesasOcupadas: mesas.filter((m) => m.ocupada).length,
    chamadosPendentes: chamados.filter((c) => c.status === "pendente").length,
    chamadosAtendidos: chamados.filter((c) => c.status === "resolvido").length,
    activeUsers: funcionarios.filter((f) => f.ativo !== false).length,
  };

  // Dados para gráficos baseados em dados reais
  const userTypeData = [
    {
      label: "Garçons",
      value: funcionarios.filter((f) => f.cargo === "garcom").length,
    },
    {
      label: "Cozinheiros",
      value: funcionarios.filter((f) => f.cargo === "cozinheiro").length,
    },
    {
      label: "Gerentes",
      value: funcionarios.filter((f) => f.cargo === "gerente").length,
    },
  ];

  const chamadosStatusData = [
    {
      label: "Pendentes",
      value: chamados.filter((c) => c.status === "pendente").length,
    },
    {
      label: "Em Atendimento",
      value: chamados.filter((c) => c.status === "em_atendimento").length,
    },
    {
      label: "Resolvidos",
      value: chamados.filter((c) => c.status === "resolvido").length,
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      ativo: "bg-green-100 text-green-800 border border-green-200",
      active: "bg-green-100 text-green-800 border border-green-200",
      inativo: "bg-gray-100 text-gray-800 border border-gray-200",
      inactive: "bg-gray-100 text-gray-800 border border-gray-200",
      pendente: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      em_atendimento: "bg-blue-100 text-blue-800 border border-blue-200",
      processing: "bg-blue-100 text-blue-800 border border-blue-200",
      resolvido: "bg-green-100 text-green-800 border border-green-200",
      completed: "bg-green-100 text-green-800 border border-green-200",
      cancelado: "bg-red-100 text-red-800 border border-red-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
      ocupada: "bg-red-100 text-red-800 border border-red-200",
      disponivel: "bg-green-100 text-green-800 border border-green-200",
    };
    return badges[status] || badges.active;
  };

  const getStatusText = (status) => {
    const texts = {
      ativo: "Ativo",
      active: "Ativo",
      inativo: "Inativo",
      inactive: "Inativo",
      pendente: "Pendente",
      pending: "Pendente",
      em_atendimento: "Em Atendimento",
      processing: "Processando",
      resolvido: "Resolvido",
      completed: "Concluído",
      cancelado: "Cancelado",
      cancelled: "Cancelado",
      ocupada: "Ocupada",
      disponivel: "Disponível",
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatCategoria = (categoria) => {
    const categorias = {
      bebida: "Bebidas",
      prato_principal: "Pratos Principais",
      sobremesa: "Sobremesas",
      entrada: "Entradas",
    };
    return categorias[categoria] || categoria;
  };

  // Função para criar nova mesa
  const handleCreateMesa = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validações
      if (!mesaForm.numero || !mesaForm.id_botao) {
        throw new Error("Número da mesa e ID do botão são obrigatórios");
      }

      const mesaData = {
        numero: parseInt(mesaForm.numero),
        id_botao: mesaForm.id_botao,
      };

      await ApiService.createMesa(mesaData);

      // Limpar formulário e fechar modal
      setMesaForm({ numero: "", id_botao: "" });
      setShowMesaModal(false);

      // Recarregar dados
      await loadData();

      alert("Mesa cadastrada com sucesso!");
    } catch (err) {
      console.error("Erro ao criar mesa:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Erro ao cadastrar mesa";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Função para criar novo produto no cardápio
  const handleCreateProduto = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validações
      if (!produtoForm.nome || !produtoForm.preco || !produtoForm.categoria) {
        throw new Error("Nome, preço e categoria são obrigatórios");
      }

      if (parseFloat(produtoForm.preco) <= 0) {
        throw new Error("Preço deve ser maior que zero");
      }

      const produtoData = {
        nome: produtoForm.nome,
        descricao: produtoForm.descricao || "",
        preco: parseFloat(produtoForm.preco),
        categoria: produtoForm.categoria,
      };

      const response = await ApiService.createCardapio(produtoData);
      console.log("Produto criado com sucesso:", response);

      // Limpar formulário e fechar modal
      setProdutoForm({ nome: "", descricao: "", preco: "", categoria: "" });
      setShowProdutoModal(false);

      // Recarregar dados
      await loadData();

      alert("Produto cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro completo ao criar produto:", err);
      console.error("Mensagem:", err.message);
      setError(err.message || "Erro ao cadastrar produto");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== FUNÇÕES DE EDIÇÃO ====================

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    return limited.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para validar CPF
  const validateCPF = (cpf) => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length !== 11) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
  };

  // Mesa - Edição
  const handleEditMesa = (mesa) => {
    setEditingMesa(mesa);
    setMesaForm({
      numero: mesa.numero,
      id_botao: mesa.id_botao,
    });
    setShowMesaModal(true);
  };

  const handleUpdateMesa = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const mesaData = {
        numero: parseInt(mesaForm.numero),
        id_botao: mesaForm.id_botao,
      };

      await ApiService.updateMesa(editingMesa._id, mesaData);

      setMesaForm({ numero: "", id_botao: "" });
      setShowMesaModal(false);
      setEditingMesa(null);
      await loadData();
      alert("Mesa atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar mesa:", err);
      setError(err.response?.data?.message || "Erro ao atualizar mesa");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMesa = async (mesaId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta mesa?")) return;

    try {
      await ApiService.deleteMesa(mesaId);
      await loadData();
      alert("Mesa excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir mesa:", err);
      alert(err.response?.data?.message || "Erro ao excluir mesa");
    }
  };

  // Produto - Edição
  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setProdutoForm({
      nome: produto.nome,
      descricao: produto.descricao || "",
      preco: produto.preco,
      categoria: produto.categoria,
    });
    setShowProdutoModal(true);
  };

  const handleUpdateProduto = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const produtoData = {
        nome: produtoForm.nome,
        descricao: produtoForm.descricao || "",
        preco: parseFloat(produtoForm.preco),
        categoria: produtoForm.categoria,
      };

      console.log("Atualizando produto:", editingProduto._id, produtoData);
      await ApiService.updateCardapio(editingProduto._id, produtoData);

      setProdutoForm({ nome: "", descricao: "", preco: "", categoria: "" });
      setShowProdutoModal(false);
      setEditingProduto(null);
      await loadData();
      alert("Produto atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
      if (err.response?.status === 409) {
        setError("Já existe um produto com este nome");
      } else if (err.response?.status === 404) {
        setError("Produto não encontrado");
      } else {
        setError(err.response?.data?.message || "Erro ao atualizar produto");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduto = async (produtoId) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await ApiService.deleteCardapio(produtoId);
      await loadData();
      alert("Produto marcado como indisponível!");
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      alert(err.response?.data?.message || "Erro ao excluir produto");
    }
  };

  // Funcionário - Edição
  const handleEditFuncionario = (funcionario) => {
    setEditingFuncionario(funcionario);
    setFuncionarioForm({
      nome: funcionario.nome,
      email: funcionario.email,
      cpf: funcionario.cpf,
      cargo: funcionario.cargo,
    });
    setShowFuncionarioModal(true);
  };

  const handleUpdateFuncionario = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const funcionarioData = {
        nome: funcionarioForm.nome,
        email: funcionarioForm.email,
        cpf: funcionarioForm.cpf.replace(/\D/g, ""),
        cargo: funcionarioForm.cargo,
      };

      await ApiService.updateUser(editingFuncionario._id, funcionarioData);

      setFuncionarioForm({ nome: "", email: "", cpf: "", cargo: "" });
      setShowFuncionarioModal(false);
      setEditingFuncionario(null);
      await loadData();
      alert("Funcionário atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar funcionário:", err);
      setError(err.response?.data?.message || "Erro ao atualizar funcionário");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFuncionario = async (funcionarioId) => {
    if (!window.confirm("Tem certeza que deseja excluir este funcionário?"))
      return;

    try {
      await ApiService.deleteUser(funcionarioId);
      await loadData();
      alert("Funcionário excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir funcionário:", err);
      alert(err.response?.data?.message || "Erro ao excluir funcionário");
    }
  };

  // Função para criar novo funcionário
  const handleCreateFuncionario = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (
        !funcionarioForm.nome ||
        !funcionarioForm.email ||
        !funcionarioForm.cpf ||
        !funcionarioForm.cargo
      ) {
        setSubmitting(false);
        setError("Todos os campos são obrigatórios");
        return;
      }

      // Validar CPF (comentado para permitir testes)
      // if (!validateCPF(funcionarioForm.cpf)) {
      //   setSubmitting(false);
      //   setError("CPF inválido. Por favor, verifique o número digitado.");
      //   return;
      // }

      const funcionarioData = {
        nome: funcionarioForm.nome,
        email: funcionarioForm.email,
        cpf: funcionarioForm.cpf.replace(/\D/g, ""),
        cargo: funcionarioForm.cargo,
      };

      await ApiService.createUser(funcionarioData);

      setFuncionarioForm({ nome: "", email: "", cpf: "", cargo: "" });
      setShowFuncionarioModal(false);
      await loadData();
      alert("Funcionário cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar funcionário:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erro ao cadastrar funcionário"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Funções para gerenciar empresa
  const handleEditEmpresa = () => {
    if (empresa) {
      setEmpresaForm({
        nomeEmpresa: empresa.nomeEmpresa || empresa.nome || "",
        tipo: empresa.tipo || "",
      });
      setShowEmpresaModal(true);
    }
  };

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!empresaForm.nomeEmpresa || !empresaForm.tipo) {
        setSubmitting(false);
        setError("Todos os campos são obrigatórios");
        return;
      }

      await ApiService.updateEmpresa(empresaForm);

      setShowEmpresaModal(false);
      await loadData();
      alert("Empresa atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar empresa:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erro ao atualizar empresa"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmpresa = async () => {
    if (
      !window.confirm(
        "⚠️ ATENÇÃO: Deseja realmente excluir sua empresa? Esta ação é IRREVERSÍVEL e apagará todos os dados (funcionários, mesas, pedidos, etc.)."
      )
    ) {
      return;
    }

    try {
      await ApiService.deleteEmpresa();
      alert(
        "Empresa excluída com sucesso. Você será deslogado."
      );
      logout();
    } catch (err) {
      console.error("Erro ao excluir empresa:", err);
      alert(
        err.response?.data?.message || err.message || "Erro ao excluir empresa"
      );
    }
  };

  // Funções para gerenciar perfil do gerente
  const handleEditPerfil = () => {
    if (user) {
      setPerfilForm({
        nome: user.nome || "",
        email: user.email || "",
      });
      setShowPerfilModal(true);
    }
  };

  const handleUpdatePerfil = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!perfilForm.nome || !perfilForm.email) {
        setSubmitting(false);
        setError("Nome e e-mail são obrigatórios");
        return;
      }

      await ApiService.updateFuncionario(user.id, {
        nome: perfilForm.nome,
        email: perfilForm.email,
      });

      setShowPerfilModal(false);
      alert("Perfil atualizado com sucesso!");
      await loadData();
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setError(
        err.response?.data?.message || err.message || "Erro ao atualizar perfil"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Voltar"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Painel Administrativo
                </h1>
                <p className="text-gray-600 mt-1">
                  {empresa ? empresa.nome : "Gerenciamento completo do sistema"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200 overflow-x-auto">
            {[
              {
                id: "overview",
                label: "Visão Geral",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
              {
                id: "users",
                label: "Funcionários",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              },
              {
                id: "mesas",
                label: "Mesas",
                icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
              },
              {
                id: "cardapio",
                label: "Cardápio",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
              },
              {
                id: "perfil",
                label: "Empresa",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={tab.icon}
                  />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando dados...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total de Funcionários"
                    value={stats.totalUsers.toLocaleString()}
                    trend="neutral"
                    change=""
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Total de Mesas"
                    value={stats.totalMesas.toLocaleString()}
                    trend="neutral"
                    change={`${stats.mesasOcupadas} ocupadas`}
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Chamados Pendentes"
                    value={stats.chamadosPendentes.toLocaleString()}
                    trend={stats.chamadosPendentes > 5 ? "down" : "neutral"}
                    change={`${stats.chamadosAtendidos} resolvidos`}
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Funcionários Ativos"
                    value={stats.activeUsers.toLocaleString()}
                    trend="up"
                    change={`${stats.totalUsers - stats.activeUsers} inativos`}
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    }
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userTypeData.some((d) => d.value > 0) && (
                    <PieChart
                      data={userTypeData}
                      title="Distribuição de Funcionários"
                      dataKey="value"
                      nameKey="label"
                    />
                  )}
                  {chamadosStatusData.some((d) => d.value > 0) && (
                    <PieChart
                      data={chamadosStatusData}
                      title="Status dos Chamados"
                      dataKey="value"
                      nameKey="label"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Funcionários
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingFuncionario(null);
                    setFuncionarioForm({
                      nome: "",
                      email: "",
                      cpf: "",
                      cargo: "",
                    });
                    setShowFuncionarioModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Novo Funcionário
                </button>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando funcionários...</p>
              </div>
            ) : funcionarios.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum funcionário encontrado
                </h3>
                <p className="text-gray-600">
                  Adicione funcionários na página de gerenciamento.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Funcionário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cadastro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {funcionarios.map((func) => (
                      <tr
                        key={func._id || func.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
                                {func.nome?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {func.nome}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {func.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {func.cpf || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {func.cargo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                              func.ativo !== false ? "ativo" : "inativo"
                            )}`}
                          >
                            {getStatusText(
                              func.ativo !== false ? "ativo" : "inativo"
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {func.createdAt
                            ? new Date(func.createdAt).toLocaleDateString(
                                "pt-BR"
                              )
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditFuncionario(func)}
                            className="text-blue-600 hover:text-blue-900 mr-3 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteFuncionario(func._id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Mesas Tab */}
        {activeTab === "mesas" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Mesas
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingMesa(null);
                    setMesaForm({ numero: "", id_botao: "" });
                    setShowMesaModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Nova Mesa
                </button>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando mesas...</p>
              </div>
            ) : mesas.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma mesa cadastrada
                </h3>
                <p className="text-gray-600">
                  Cadastre mesas para começar a gerenciar seu estabelecimento.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID do Botão
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mesas.map((mesa) => (
                      <tr
                        key={mesa._id || mesa.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-bold">
                                {mesa.numero}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Mesa {mesa.numero}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                            {mesa.id_botao || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              mesa.status === "livre"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : mesa.status === "ocupada"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : mesa.status === "aguardando_atendimento"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : mesa.status === "aguardando_pagamento"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {mesa.status === "livre"
                              ? "Livre"
                              : mesa.status === "ocupada"
                              ? "Ocupada"
                              : mesa.status === "aguardando_atendimento"
                              ? "Aguardando Atendimento"
                              : mesa.status === "aguardando_pagamento"
                              ? "Aguardando Pagamento"
                              : mesa.status || "Livre"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditMesa(mesa)}
                            className="text-blue-600 hover:text-blue-900 mr-3 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMesa(mesa._id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Cardápio Tab */}
        {activeTab === "cardapio" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Gerenciamento de Cardápio
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProdutoModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Novo Produto
                </button>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Atualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Carregando cardápio...</p>
              </div>
            ) : cardapios.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum produto cadastrado
                </h3>
                <p className="text-gray-600">
                  Cadastre produtos para montar o cardápio do seu
                  estabelecimento.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disponível
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cadastro
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cardapios.map((produto) => (
                      <tr
                        key={produto._id || produto.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-700 font-bold">
                                {produto.nome?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {produto.nome}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {produto.descricao || "Sem descrição"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCategoria(produto.categoria)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          R$ {produto.preco?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              produto.disponivel !== false
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {produto.disponivel !== false
                              ? "Disponível"
                              : "Indisponível"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {produto.createdAt
                            ? new Date(produto.createdAt).toLocaleDateString(
                                "pt-BR"
                              )
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditProduto(produto)}
                            className="text-blue-600 hover:text-blue-900 mr-3 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProduto(produto._id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empresa Tab */}
        {activeTab === "perfil" && (
          <div className="space-y-6">
            {/* Informações da Empresa */}
            {empresa && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Dados da Empresa
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa
                    </label>
                    <p className="text-lg text-gray-900">
                      {empresa.nomeEmpresa || empresa.nome}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <p className="text-lg text-gray-900">
                      {empresa.tipo || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <p className="text-lg text-gray-900">
                      {empresa.cnpj || "Não informado"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleEditEmpresa}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar Dados da Empresa
                  </button>
                  <button
                    onClick={handleDeleteEmpresa}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Excluir Empresa
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Relatórios tab removed - content moved to Dashboard */}
      </div>

      {/* Modal de Cadastro de Mesa */}
      {showMesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingMesa ? "Editar Mesa" : "Cadastrar Nova Mesa"}
                </h3>
                <button
                  onClick={() => {
                    setShowMesaModal(false);
                    setMesaForm({ numero: "", id_botao: "" });
                    setEditingMesa(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form
                onSubmit={editingMesa ? handleUpdateMesa : handleCreateMesa}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Mesa *
                  </label>
                  <input
                    type="number"
                    value={mesaForm.numero}
                    onChange={(e) =>
                      setMesaForm({ ...mesaForm, numero: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: 1, 2, 3..."
                    required
                    min="1"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Botão *
                  </label>
                  <input
                    type="text"
                    value={mesaForm.id_botao}
                    onChange={(e) =>
                      setMesaForm({ ...mesaForm, id_botao: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: BTN001, BTN002, MESA01..."
                    required
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identificador único do botão físico da mesa
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMesaModal(false);
                      setMesaForm({ numero: "", id_botao: "" });
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Cadastrar Mesa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Produto */}
      {showProdutoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Cadastrar Novo Produto
                </h3>
                <button
                  onClick={() => {
                    setShowProdutoModal(false);
                    setProdutoForm({
                      nome: "",
                      descricao: "",
                      preco: "",
                      categoria: "",
                    });
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateProduto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={produtoForm.nome}
                    onChange={(e) =>
                      setProdutoForm({ ...produtoForm, nome: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Hambúrguer Artesanal"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={produtoForm.descricao}
                    onChange={(e) =>
                      setProdutoForm({
                        ...produtoForm,
                        descricao: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descreva o produto..."
                    rows="3"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={produtoForm.preco}
                    onChange={(e) =>
                      setProdutoForm({ ...produtoForm, preco: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: 25.90"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={produtoForm.categoria}
                    onChange={(e) =>
                      setProdutoForm({
                        ...produtoForm,
                        categoria: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="bebida">Bebidas</option>
                    <option value="prato_principal">Pratos Principais</option>
                    <option value="sobremesa">Sobremesas</option>
                    <option value="entrada">Entradas</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProdutoModal(false);
                      setProdutoForm({
                        nome: "",
                        descricao: "",
                        preco: "",
                        categoria: "",
                      });
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Cadastrar Produto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Funcionário */}
      {showFuncionarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingFuncionario
                    ? "Editar Funcionário"
                    : "Cadastrar Novo Funcionário"}
                </h3>
                <button
                  onClick={() => {
                    setShowFuncionarioModal(false);
                    setFuncionarioForm({
                      nome: "",
                      email: "",
                      cpf: "",
                      cargo: "",
                    });
                    setEditingFuncionario(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form
                onSubmit={
                  editingFuncionario
                    ? handleUpdateFuncionario
                    : handleCreateFuncionario
                }
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={funcionarioForm.nome}
                    onChange={(e) =>
                      setFuncionarioForm({
                        ...funcionarioForm,
                        nome: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: João da Silva"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={funcionarioForm.email}
                    onChange={(e) =>
                      setFuncionarioForm({
                        ...funcionarioForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: joao@example.com"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={funcionarioForm.cpf}
                    onChange={(e) =>
                      setFuncionarioForm({
                        ...funcionarioForm,
                        cpf: formatCPF(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="000.000.000-00"
                    required
                    maxLength="14"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <select
                    value={funcionarioForm.cargo}
                    onChange={(e) =>
                      setFuncionarioForm({
                        ...funcionarioForm,
                        cargo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecione um cargo</option>
                    <option value="garcom">Garçom</option>
                    <option value="cozinheiro">Cozinheiro</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFuncionarioModal(false);
                      setFuncionarioForm({
                        nome: "",
                        email: "",
                        cpf: "",
                        cargo: "",
                      });
                      setEditingFuncionario(null);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {editingFuncionario
                          ? "Atualizando..."
                          : "Cadastrando..."}
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {editingFuncionario
                          ? "Atualizar Funcionário"
                          : "Cadastrar Funcionário"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Empresa */}
      {showEmpresaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Editar Dados da Empresa
                </h3>
                <button
                  onClick={() => {
                    setShowEmpresaModal(false);
                    setEmpresaForm({ nomeEmpresa: "", tipo: "" });
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleUpdateEmpresa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={empresaForm.nomeEmpresa}
                    onChange={(e) =>
                      setEmpresaForm({
                        ...empresaForm,
                        nomeEmpresa: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Restaurante Sabor da Casa"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={empresaForm.tipo}
                    onChange={(e) =>
                      setEmpresaForm({ ...empresaForm, tipo: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  >
                    <option value="">Selecione...</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Bar">Bar</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmpresaModal(false);
                      setEmpresaForm({ nomeEmpresa: "", tipo: "" });
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Atualizar Empresa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Perfil */}
      {showPerfilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Editar Meu Perfil
                </h3>
                <button
                  onClick={() => {
                    setShowPerfilModal(false);
                    setPerfilForm({ nome: "", email: "" });
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleUpdatePerfil} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={perfilForm.nome}
                    onChange={(e) =>
                      setPerfilForm({ ...perfilForm, nome: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: João Silva"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={perfilForm.email}
                    onChange={(e) =>
                      setPerfilForm({ ...perfilForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: joao@empresa.com"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPerfilModal(false);
                      setPerfilForm({ nome: "", email: "" });
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Atualizar Perfil
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
