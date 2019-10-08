# Facades

## Introdução
As facades fornecem uma interface "estática" para as classes disponíveis no contêiner de serviço do aplicativo. O Laravel é 
fornecido com muitas facades que fornecem acesso a quase todos os recursos do Laravel. As facades do Laravel servem como 
"proxies estáticos" para as classes subjacentes no contêiner de serviço, oferecendo o benefício de uma sintaxe concisa e 
expressiva, mantendo mais testável e flexível do que os métodos estáticos tradicionais.

Todas as facades do Laravel são definidas no namespace `Illuminate\Support\Facades`. Assim, podemos acessar facilmente uma 
facade assim:

``` php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

Em toda a documentação do Laravel, muitos dos exemplos usarão facades para demonstrar vários recursos da estrutura.

## Quando usar facades
Facades têm muitos benefícios. Eles fornecem uma sintaxe concisa e memorável que permite usar os recursos do Laravel sem lembrar de
nomes de classes longos que devem ser injetados ou configurados manualmente. Além disso, devido ao uso exclusivo dos métodos 
dinâmicos do PHP, eles são fáceis de testar.

No entanto, alguns cuidados devem ser tomados ao usar facades. O principal perigo das facades é a fluência no escopo da classe. 
Como as facades são muito fáceis de usar e não requerem injeção, pode ser fácil permitir que suas classes continuem a crescer e 
usar muitas facades em uma única classe. Usando injeção de dependência, esse potencial é atenuado pelo feedback visual que um 
grande construtor fornece a você que sua classe está crescendo muito. Portanto, ao usar facades, preste atenção especial ao 
tamanho da sua classe, para que seu escopo de responsabilidade permaneça restrito.

> Ao criar um pacote de terceiros que interaja com o Laravel, é melhor injetar contratos do Laravel em vez de usar facades. 
> Como os pacotes são construídos fora do próprio Laravel, você não terá acesso aos auxiliares de teste de facades do Laravel.

## Facades vs. Injeção de dependência
Um dos principais benefícios da injeção de dependência é a capacidade de trocar implementações da classe injetada. Isso é 
útil durante o teste, pois você pode injetar uma simulação ou esboço e afirmar que vários métodos foram chamados no esboço.

Normalmente, não seria possível mock ou stub de um método de classe verdadeiramente estático. No entanto, como as facades 
usam métodos dinâmicos para proxy de chamadas de método para objetos resolvidos a partir do contêiner de serviço, na verdade 
podemos testar facades da mesma maneira que testamos uma instância de classe injetada. Por exemplo, dada a seguinte rota:

``` php
use Illuminate\Support\Facades\Cache;

Route::get('/cache', function () {
    return Cache::get('key');
});
```

Podemos escrever o seguinte teste para verificar se o método `Cache::get` foi chamado com o argumento que esperávamos:
