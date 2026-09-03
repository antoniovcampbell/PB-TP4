package com.pbtp1.avaliacoes.controller;

import com.pbtp1.avaliacoes.model.Avaliacao;
import com.pbtp1.avaliacoes.service.AvaliacaoService;
import com.pbtp1.shared.dto.AvaliacaoDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @GetMapping
    public List<AvaliacaoDTO> listar(
            @RequestParam(required = false) Long produtoId,
            @RequestParam(required = false) Integer nota) {

        if (produtoId != null && nota != null) {
            return avaliacaoService.listarPorProdutoENota(produtoId, nota);
        }
        if (produtoId != null) {
            return avaliacaoService.listarPorProduto(produtoId);
        }
        return avaliacaoService.listarTodas();
    }

    @GetMapping("/{id}")
    public AvaliacaoDTO buscarPorId(@PathVariable Long id) {
        return avaliacaoService.buscarPorId(id);
    }

    @GetMapping("/produtos/{produtoId}")
    public List<AvaliacaoDTO> listarPorProduto(@PathVariable Long produtoId) {
        return avaliacaoService.listarPorProduto(produtoId);
    }

    @GetMapping("/produtos/{produtoId}/media")
    public AvaliacaoService.MediaAvaliacao calcularMedia(@PathVariable Long produtoId) {
        return avaliacaoService.calcularMediaPorProduto(produtoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoDTO salvar(@Valid @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.salvar(avaliacao);
    }

    @PutMapping("/{id}")
    public AvaliacaoDTO atualizar(@PathVariable Long id,
                                  @Valid @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.atualizar(id, avaliacao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        avaliacaoService.deletar(id);
    }
}