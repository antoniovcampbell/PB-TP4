package com.pbtp1.avaliacoes.config;

import com.pbtp1.shared.messaging.RabbitMQConstantes;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    @Bean
    public TopicExchange produtosExchange() {
        return new TopicExchange(RabbitMQConstantes.EXCHANGE_PRODUTOS, true, false);
    }

    @Bean
    public Queue produtosQueue() {
        return new Queue(RabbitMQConstantes.FILA_PRODUTOS, true);
    }

    @Bean
    public Binding produtosBinding(Queue produtosQueue, TopicExchange produtosExchange) {
        return BindingBuilder.bind(produtosQueue).to(produtosExchange).with("produto.*");
    }

}
