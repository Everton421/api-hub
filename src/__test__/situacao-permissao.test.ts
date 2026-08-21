import test from "node:test";
import assert from "node:assert/strict";
import {
    derivarSituacoes,
    temPermissaoVerTodos,
    TODAS_SITUACOES,
    VER_TODOS_PERMISSAO
} from "../services/SituacaoPermissao.ts";

test("derivarSituacoes - permissao ver_todos retorna todas as situacoes", () => {
    const result = derivarSituacoes([VER_TODOS_PERMISSAO, "pedidos.ver_cancelados"]);
    assert.equal(result.length, TODAS_SITUACOES.length);
    assert.deepEqual(result.map(s => s.situacao), TODAS_SITUACOES);
});

test("derivarSituacoes - combina as permissoes informadas", () => {
    const result = derivarSituacoes(["pedidos.ver_em_aberto", "pedidos.ver_cancelados"]);
    assert.deepEqual(result.map(s => s.situacao), ["EA", "RE"]);
});

test("derivarSituacoes - nenhuma permissao retorna lista vazia", () => {
    const result = derivarSituacoes([]);
    assert.deepEqual(result, []);
});

test("derivarSituacoes - permissao de outra area e ignorada", () => {
    const result = derivarSituacoes(["produtos.ler", "pedidos.ver_aprovados"]);
    assert.deepEqual(result.map(s => s.situacao), ["AI"]);
});

test("derivarSituacoes - inclui a descricao de cada situacao", () => {
    const result = derivarSituacoes(["pedidos.ver_baixados"]);
    assert.deepEqual(result, [{ situacao: "BM", descricao: "Baixado manualmente" }]);
});

test("temPermissaoVerTodos - identifica a permissao ver_todos", () => {
    assert.equal(temPermissaoVerTodos([VER_TODOS_PERMISSAO]), true);
    assert.equal(temPermissaoVerTodos(["pedidos.ver_aprovados"]), false);
    assert.equal(temPermissaoVerTodos([]), false);
});
