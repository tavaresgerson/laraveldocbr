## Esquema de versão

O esquema de versão do Laravel mantém a seguinte convenção: paradigma.maior.menor. Os principais lançamentos de estrutura são lançados a cada seis meses (fevereiro e agosto), enquanto os lançamentos menores podem ser lançados sempre que a cada semana. Versões menores nunca devem conter alterações de última hora.

Ao referenciar a estrutura do Laravel ou seus componentes a partir de seu aplicativo ou pacote, você deve sempre usar uma restrição de versão como 5.8.*, Pois as principais versões do Laravel incluem alterações recentes. No entanto, nos esforçamos para garantir que você possa atualizar para uma nova versão principal em um dia ou menos.

As versões de mudança de paradigma são separadas por muitos anos e representam mudanças fundamentais na arquitetura e nas convenções da estrutura. Atualmente, não há liberação de mudança de paradigma em desenvolvimento.


## Política de Suporte

Para versões LTS, como o Laravel 5.5, são fornecidas correções de bugs por 2 anos e correções de segurança por 3 anos. Esses lançamentos fornecem a janela mais longa de suporte e manutenção. Para liberações gerais, são fornecidas correções de erros por 6 meses e correções de segurança por 1 ano. Para todas as bibliotecas adicionais, incluindo o Lumen, apenas a versão mais recente recebe correções de bugs.

| Versão    | Release                   | Correções de bugs até         | Correções de segurança até    |
|-----------|---------------------------|-------------------------------|-------------------------------|
| 5.0       | 04 de fevereiro de 2015   | 04 de agosto de 2015          | 04 de fevereiro de 2016       |
| 5.1 (LTS) | 09 de junho de 2015       | 09 de junho de 2017           | 09 de junho de 2018           |
| 5.2       | 21 de dezembro de 2015    | 21 de junho de 2016           | 21 de dezembro de 2016        |
| 5.3       | 23 de agosto de 2016      | 23 de fevereiro de 2017       | 23 de agosto de 2017          |
| 5.4       | 24 de janeiro de 2017     | 24 de julho de 2017           | 24 de janeiro de 2018         |
| 5.5 (LTS) | 30 de agosto de 2017      | 30 de agosto de 2019          | 30 de agosto de 2020          |
| 5.6       | 07 de fevereiro de 2018   | 07 de agosto de 2018          | 07 de fevereiro de 2019       |
| 5.7       | 04 de setembro de 2018    | 04 de março de 2019           | 04 de setembro de 2019        |
| 5.8       | 26 de fevereiro de 2019   | 26 de agosto de 2019          | 26 de setembro de 2020        |

## Laravel 5.8

O Laravel 5.8 continua com as melhorias feitas no Laravel 5.7, introduzindo relacionamentos com o Eloquent de um por um, validação aprimorada de email, registro automático de políticas de autorização com base em convenções, cache do DynamoDB e drivers de sessão, configuração aprimorada do fuso horário do agendador, suporte para a atribuição de vários protetores de autenticação para broadcast de canais, conformidade com o driver de cache PSR-16, melhorias no comando `artisan serve`, suporte ao PHPUnit 8.0, suporte ao Carbon 2.0, suporte ao Pheanstalk 4.0 e uma variedade de outras correções de bugs e melhorias de usabilidade.


## Relacionamento Eloquent `HasOneThrough`

O Eloquent agora fornece suporte para o tipo de relacionamento `hasOneThrough`. Por exemplo, imagine um modelo `hasOne` de Fornecedor, com um modelo de Conta e um modelo de Conta, com um modelo de Histórico de Conta. Você pode usar um relacionamento `hasOneThrough` para acessar o histórico da conta de um fornecedor por meio do modelo de conta:

 
```php
/**
 * Obtêm o histórico da conta do fornecedor.
 */
public function accountHistory()
{
    return $this->hasOneThrough(AccountHistory::class, Account::class);
}
```

## Descoberta automática de políticas de modelo

Ao usar o Laravel 5.7, a política de autorização correspondente de cada modelo precisava ser registrada explicitamente no `AuthServiceProvider` do seu aplicativo:

```php
/**
 * Os mapeamentos de política para o aplicativo.
 *
 * @var array
 */
protected $policies = [
    'App\User' => 'App\Policies\UserPolicy',
];
```
