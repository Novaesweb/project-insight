import{j as c}from"./ui-DZtF8fqY.js";import{s as v,L as w,p as N,c as h}from"./index-BTtcP8fp.js";import{aR as O,b9 as z,ba as j,aW as k,a1 as D,R as L,ac as I,J as M,aF as B,f as V}from"./icons-BHXEjiif.js";import{r as P}from"./router-PMeMBMb8.js";import{P as F}from"./public-plans-C8Dg89sD.js";const q={rascunho_salvo:"Rascunho salvo",cofre_salvo:"Contrato salvo no cofre",enviado:"Contrato enviado ao cliente",visualizado:"Contrato visualizado",assinado:"Contrato aprovado",ajuste_solicitado:"Ajuste solicitado",reassinatura_pendente:"Nova assinatura solicitada",onboarding_iniciado:"Onboarding iniciado",arquivado:"Contrato arquivado",desarquivado:"Contrato desarquivado",duplicado:"Proposta duplicada"};function y(e){return q[e]||e}function W(e){return w(new Date(e),{addSuffix:!0,locale:N})}async function Se(e){const{error:a}=await v.from("contrato_eventos").insert({contrato_id:e.contratoId,tipo:e.tipo,titulo:e.titulo,descricao:e.descricao??null,actor_type:e.actorType??"admin",actor_id:e.actorId??null,meta:e.meta??{}});if(a)throw a}async function $e(e,a,t="/admin/contratos"){const{error:o}=await v.from("notifications").insert({title:e,body:a,url:t,user_type:"admin",user_id:"admin"});if(o)throw o}async function Te(e,a,t,o="/cliente/contratos"){const{error:n}=await v.from("notifications").insert({title:a,body:t,url:o,user_type:"cliente",user_id:e});if(n)throw n}function U(e){switch(e){case"enviado":return B;case"visualizado":return M;case"assinado":return I;case"reassinatura_pendente":return L;case"onboarding_iniciado":return D;case"arquivado":return k;case"desarquivado":return j;case"duplicado":return z;default:return O}}function Ee({events:e,loading:a=!1,emptyLabel:t="Nenhuma movimentação registrada ainda."}){return a?c.jsx("div",{className:"rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/45",children:"Carregando atividade do contrato..."}):e.length===0?c.jsx("div",{className:"rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/45",children:t}):c.jsx("div",{className:"space-y-3",children:e.map(o=>{const n=U(o.tipo);return c.jsxs("div",{className:"flex items-start gap-3 rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.12),rgba(232,51,74,0.08),rgba(255,255,255,0.03))] p-4",children:[c.jsx("div",{className:"mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]",children:c.jsx(n,{className:"h-4 w-4 text-rose-200"})}),c.jsxs("div",{className:"min-w-0 flex-1",children:[c.jsxs("div",{className:"flex items-center gap-2 flex-wrap",children:[c.jsx("p",{className:"text-sm font-medium text-white",children:o.titulo||y(o.tipo)}),c.jsx("span",{className:"text-[10px] uppercase tracking-[0.18em] text-white/30",children:W(o.created_at)})]}),c.jsx("p",{className:"mt-1 text-xs text-white/55",children:o.descricao||"Evento operacional registrado no histórico do contrato."}),c.jsx("p",{className:"mt-2 text-[10px] uppercase tracking-[0.16em] text-white/30",children:o.actor_type==="cliente"?"Cliente":o.actor_type==="admin"?"Admin":"Sistema"})]})]},o.id)})})}const G={dark:"border-white/10 bg-[linear-gradient(135deg,rgba(123,31,162,0.2),rgba(232,51,74,0.14),rgba(194,24,91,0.18))] text-white shadow-[0_24px_54px_rgba(20,8,31,0.36)]",light:"border-rose-200/70 bg-[linear-gradient(135deg,rgba(123,31,162,0.08),rgba(232,51,74,0.09),rgba(194,24,91,0.12))] text-slate-900 shadow-[0_20px_42px_rgba(123,31,162,0.12)]"},H={dark:"text-white/70",light:"text-[#9f2d84]"},X={dark:"text-white/55",light:"text-slate-500"},Y={dark:"border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] text-white backdrop-blur-xl",light:"border-rose-100 bg-white/90 text-slate-900 backdrop-blur"},Q={dark:"text-white/55",light:"text-slate-500"},J={dark:"text-white/48",light:"text-slate-500"},Z={dark:"border-emerald-300/20 bg-emerald-300/10 text-emerald-100 shadow-[0_12px_28px_rgba(16,185,129,0.12)]",light:"border-emerald-300/30 bg-emerald-50 text-emerald-900 shadow-[0_10px_24px_rgba(16,185,129,0.08)]"};function K(e){return e?new Date(e).toLocaleString("pt-BR"):null}function we({summary:e,variant:a="dark",className:t}){return e?c.jsxs("section",{className:h("rounded-[30px] border px-6 py-7 text-center md:px-8 md:py-9",G[a],t),children:[c.jsxs("div",{className:"space-y-2",children:[c.jsx("p",{className:h("text-[10px] font-semibold uppercase tracking-[0.28em]",H[a]),children:"Aceite e assinatura"}),c.jsx("p",{className:h("text-sm",X[a]),children:e.locationAndDate})]}),c.jsx("div",{className:"mt-6 grid gap-4 md:grid-cols-2",children:[{name:e.contractanteName,caption:e.contractanteCaption},{name:e.contratadaName,caption:e.contratadaCaption}].map(o=>c.jsxs("div",{className:h("rounded-[24px] border px-5 py-6 text-center",Y[a]),children:[c.jsx("div",{className:"mx-auto h-px w-full bg-[linear-gradient(90deg,rgba(123,31,162,0.42),rgba(232,51,74,0.78),rgba(194,24,91,0.52))]"}),c.jsx("p",{className:"mt-5 text-lg font-semibold",children:o.name}),c.jsx("p",{className:h("mt-2 text-xs leading-relaxed",Q[a]),children:o.caption})]},`${o.name}-${o.caption}`))}),c.jsx("p",{className:h("mx-auto mt-5 max-w-2xl text-xs leading-relaxed",J[a]),children:e.note})]}):null}function Ne({signedName:e,signedAt:a,className:t,variant:o="dark"}){if(!(e!=null&&e.trim()))return null;const n=K(a);return c.jsxs("div",{className:h("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",Z[o],t),children:[c.jsx(V,{className:"h-3.5 w-3.5 shrink-0"}),c.jsxs("span",{className:"truncate",children:["Assinado por ",e.trim()]}),n?c.jsxs("span",{className:"hidden sm:inline opacity-80",children:["• ",n]}):null]})}function Pe({channelName:e,filter:a,enabled:t=!0,onUpsert:o,onDelete:n}){P.useEffect(()=>{if(!t)return;const d=v.channel(e),s={event:"*",schema:"public",table:"contratos"};return a&&(s.filter=a),d.on("postgres_changes",s,l=>{var p;if(l.eventType==="DELETE"){const g=String(((p=l.old)==null?void 0:p.id)||"");g&&(n==null||n(g));return}const r=l.new;r!=null&&r.id&&(o==null||o(r))}).subscribe(),()=>{v.removeChannel(d)}},[e,t,a,n,o])}function _e({contractId:e,enabled:a=!0,onInsert:t}){P.useEffect(()=>{if(!a||!e)return;const o=v.channel(`contract-events-${e}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"contrato_eventos",filter:`contrato_id=eq.${e}`},n=>{const d=n.new;d!=null&&d.id&&(t==null||t(d))}).subscribe();return()=>{v.removeChannel(o)}},[e,a,t])}function m(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const ee=/\n{0,2}(CONTRATANTE|CONTRATADA):\s*_+\s*(?=\n|$)/gi,ae={nome:"NovaesWeb",representante:"Lucas Rodrigo Ferreira dos Santos",documento:"503.328.838-50",endereco:"Estrada da Prainha, 630 – Mato Grande, Canoas – RS",observacaoRecebimento:"A NovaesWeb está no início da operação e utiliza CPF como forma de recebimento neste momento."},te="Não estão inclusos serviços, licenças, integrações, campanhas pagas, textos, fotos, artes, hospedagem, domínio ou novas funcionalidades não descritas na proposta aprovada.",oe="Serviços recorrentes, extras, integrações, mídia paga, domínio, hospedagem e demandas fora do escopo poderão ser contratados e cobrados à parte mediante aprovação do contratante.",ne="PIX, boleto, cartão ou link de pagamento";function Re(e=[]){const a=new Date().toISOString(),t=se();return{clienteId:"",lastStep:0,primaryPlanId:"none",contractante:{nome:"",nomeEmpresa:"",documento:"",email:"",whatsapp:"",telefone:"",instagram:"",siteUrl:"",endereco:"",cep:"",cidade:"",estado:""},contratada:{...ae},items:t,clientExtrasSnapshot:[],customScope:"",prazoDias:"15",formaPagamento:ne,numeroRevisoes:"2",valorRevisao:"150,00",prazoSuporte:"30 dias após a entrega",observacoesComerciais:oe,escopoExclusoes:te,pricing:ce(t),createdAt:a,updatedAt:a}}function u(e){return`R$ ${Number(e||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function re(e){return String(e||"").replace(ee,"").replace(/\n{3,}/g,`

`).trim()}function Oe(e){if(typeof e=="number")return Number.isFinite(e)?e:0;const a=String(e||"").replace(/[^\d,.-]/g,"").replace(/\./g,"").replace(",","."),t=parseFloat(a);return Number.isFinite(t)?t:0}function ie(e){var x,i,b,S,T,f,C;const a=((x=e.endereco)==null?void 0:x.trim())||"",t="numero_endereco"in e&&((i=e.numero_endereco)==null?void 0:i.trim())||"",o=((b=e.complemento)==null?void 0:b.trim())||"",n=((S=e.bairro)==null?void 0:S.trim())||"",d=((T=e.cidade)==null?void 0:T.trim())||"",s=((f=e.estado)==null?void 0:f.trim())||"",l=((C=e.cep)==null?void 0:C.trim())||"",r=[a,t].filter(Boolean).join(", "),p=[o,n].filter(Boolean).join(" — "),g=[d,s].filter(Boolean).join(" / ");return[r,p,g,l].filter(Boolean).join(" | ")}function ze(e){return{nome:e.nome||"",nomeEmpresa:e.nome_empresa||"",documento:e.documento||"",email:e.email||"",whatsapp:e.whatsapp||"",telefone:e.telefone||"",instagram:e.instagram||"",siteUrl:e.site_url||"",endereco:ie(e),cep:e.cep||"",cidade:e.cidade||"",estado:e.estado||""}}function se(e){return F.map(a=>({id:`plan:${a.id}`,source:"plan",sourceId:a.id,group:"planos",name:a.title,description:a.description,selected:!1,setupPrice:a.setupPrice,monthlyPrice:a.monthlyPrice,isPrimaryPlan:!0}))}function A(e){return e.find(a=>a.isPrimaryPlan&&a.selected)||null}function $(e){return e.clientExtrasSnapshot.length>0?e.clientExtrasSnapshot:e.items.filter(a=>a.selected&&!a.isPrimaryPlan).map(a=>({id:a.id,extraId:a.sourceId||a.id,name:a.name,description:a.description,category:a.group,typeLabel:a.monthlyPrice>0?"mensal":"único",setupPrice:a.setupPrice,monthlyPrice:a.monthlyPrice}))}function je(e,a){return e.map(t=>t.isPrimaryPlan?a==="none"?{...t,selected:!1}:{...t,selected:t.id===`plan:${a}`}:t)}function ce(e,a=[],t){const o=A(e),n=a.length>0?a:e.filter(f=>f.selected&&!f.isPrimaryPlan).map(f=>({setupPrice:f.setupPrice,monthlyPrice:f.monthlyPrice})),d=Number((o==null?void 0:o.setupPrice)||0)+n.reduce((f,C)=>f+Number(C.setupPrice||0),0),s=Number((o==null?void 0:o.monthlyPrice)||0)+n.reduce((f,C)=>f+Number(C.monthlyPrice||0),0),l=(t==null?void 0:t.negotiatedSetup)??d,r=(t==null?void 0:t.negotiatedMonthly)??s,p=(t==null?void 0:t.discountType)==="percentage"?"percentage":"fixed",g=Math.max(Number((t==null?void 0:t.discountValue)||0),0),x=Math.min(p==="percentage"?l*g/100:g,l),i=Math.max(l-x,0),b=Math.min((t==null?void 0:t.entryValue)??0,i),S=Math.max(i-b,0);return{setupSubtotal:d,monthlySubtotal:s,negotiatedSetup:l,discountType:p,discountValue:g,discountAmount:x,finalSetupTotal:i,entryValue:b,balanceValue:S,negotiatedMonthly:r,finalMonthlyTotal:r}}function ke(e){const a=e.find(t=>t.isPrimaryPlan&&t.selected);return(a==null?void 0:a.sourceId)||"none"}function de(e){const a=A(e.items),t=$(e);return e.primaryPlanId==="sob-medida"&&e.customScope.trim()?[e.customScope.trim(),a!=null&&a.name?`Plano base: ${a.name}`:null,t.length?`Itens adicionais contratados: ${t.map(o=>o.name).join(", ")}`:null].filter(Boolean).join(" | "):[(a==null?void 0:a.name)||null,...t.map(o=>o.name)].filter(Boolean).join(", ")}function _(e){if(!e.selected)return"(Não incluso neste pacote)";const a=e.setupPrice>0?u(e.setupPrice):"Incluso",t=e.monthlyPrice>0?u(e.monthlyPrice):"Incluso";return e.group==="mensal"&&e.setupPrice<=0?`${t}/mês`:e.monthlyPrice>0?`${a} (Setup) / ${t} (Mensal)`:`${a} (Setup)`}function R(e){const a=e.setupPrice>0?u(e.setupPrice):"Incluso",t=e.monthlyPrice>0?`${u(e.monthlyPrice)}/mês`:"Sem recorrência";return e.monthlyPrice>0&&e.setupPrice>0?`${a} + ${t}`:e.monthlyPrice>0?t:a}function le(e){const a=A(e.items),t=$(e),o=["RESUMO COMERCIAL DA PROPOSTA:",""];return a&&(o.push("PLANO CONTRATADO:"),o.push(`• ${a.name} — ${_(a)}`),o.push("")),e.primaryPlanId==="sob-medida"&&e.customScope.trim()&&(o.push("ESCOPO CUSTOMIZADO:"),o.push(e.customScope.trim()),o.push("")),t.length&&(o.push("EXTRAS CONTRATADOS:"),t.forEach(n=>{o.push(`• ${n.name} — ${R(n)} — Tipo: ${n.typeLabel}`)}),o.push("")),o.push("CONDIÇÕES COMERCIAIS:"),o.push(`• Subtotal da implantação: ${u(e.pricing.setupSubtotal)}`),o.push(`• Desconto aplicado: ${u(e.pricing.discountAmount)}`),o.push(`• Valor final da implantação: ${u(e.pricing.finalSetupTotal)}`),o.push(`• Entrada / sinal: ${u(e.pricing.entryValue)}`),o.push(`• Saldo na entrega: ${u(e.pricing.balanceValue)}`),e.pricing.finalMonthlyTotal>0&&o.push(`• Mensalidade contratada: ${u(e.pricing.finalMonthlyTotal)}`),o.join(`
`)}function De(e){return{nome_cliente:e.contractante.nome,cpf_cnpj:e.contractante.documento,endereco:e.contractante.endereco,nome_contratada:`${e.contratada.nome}, representada por seu fundador e CEO ${e.contratada.representante}`,cpf_cnpj_contratada:e.contratada.documento,endereco_contratada:e.contratada.endereco,cidade_foro:"Canoas",estado_foro:"RS",lista_servicos:de(e),tabela_servicos:le(e),escopo_exclusoes:e.escopoExclusoes,prazo_dias:e.prazoDias,valor_entrada:e.pricing.entryValue.toFixed(2).replace(".",","),valor_saldo:e.pricing.balanceValue.toFixed(2).replace(".",","),valor_mensal:e.pricing.finalMonthlyTotal.toFixed(2).replace(".",","),dia_vencimento:"10",forma_pagamento:e.formaPagamento,numero_revisoes:e.numeroRevisoes,valor_revisao:e.valorRevisao,prazo_suporte:e.prazoSuporte,observacoes_comerciais:e.observacoesComerciais,data:new Date().toISOString().slice(0,10)}}function me(e){var s,l,r,p,g,x;const a=A(e.items),t=$(e).map(i=>({name:i.name,description:i.description,pricing:R(i),highlight:i.typeLabel==="mensal"?"Extra mensal":"Extra único"})),o=[(s=e.contractante.nomeEmpresa)!=null&&s.trim()?`Empresa: ${e.contractante.nomeEmpresa.trim()}`:null,(l=e.contractante.documento)!=null&&l.trim()?`Documento: ${e.contractante.documento.trim()}`:null,(r=e.contractante.email)!=null&&r.trim()?`E-mail: ${e.contractante.email.trim()}`:null,(p=e.contractante.whatsapp)!=null&&p.trim()?`WhatsApp: ${e.contractante.whatsapp.trim()}`:null,(g=e.contractante.telefone)!=null&&g.trim()?`Telefone: ${e.contractante.telefone.trim()}`:null,(x=e.contractante.endereco)!=null&&x.trim()?`Endereço: ${e.contractante.endereco.trim()}`:null].filter(Boolean),n=[`Representante: ${e.contratada.representante}`,`Documento: ${e.contratada.documento}`,`Endereço: ${e.contratada.endereco}`,e.contratada.observacaoRecebimento.trim()].filter(Boolean),d=[`Subtotal da implantação: ${u(e.pricing.setupSubtotal)}`,`Desconto aplicado: ${u(e.pricing.discountAmount)}`,`Valor final da implantação: ${u(e.pricing.finalSetupTotal)}`,`Entrada / sinal: ${u(e.pricing.entryValue)}`,`Saldo na entrega: ${u(e.pricing.balanceValue)}`,e.pricing.finalMonthlyTotal>0?`Mensalidade contratada: ${u(e.pricing.finalMonthlyTotal)}`:null,`Prazo estimado: ${e.prazoDias} dias úteis`,`Pagamento: ${e.formaPagamento}`].filter(Boolean);return{contractante:{eyebrow:"Contratante",title:e.contractante.nome.trim()||"Contratante",lines:o},contratada:{eyebrow:"Contratada",title:e.contratada.nome.trim()||"Contratada",lines:n},comercial:{eyebrow:"Comercial",title:"Condições comerciais",lines:d},selectedPlan:a?{name:a.name,description:a.description,pricing:_(a),highlight:"Plano principal"}:null,selectedServices:t,customScope:e.primaryPlanId==="sob-medida"?e.customScope.trim():""}}function ue(e,a){var d,s;if(!e)return null;const o=`Canoas/RS, ${(a!=null&&a.signedAt?new Date(a.signedAt):new Date).toLocaleDateString("pt-BR")}`,n=((d=a==null?void 0:a.contractanteSignedName)==null?void 0:d.trim())||e.contractante.nome.trim()||"Contratante";return{locationAndDate:o,contractanteName:n,contractanteCaption:a!=null&&a.signedAt?"Aceite eletrônico registrado no portal":"Nome do responsável pelo contratante",contratadaName:e.contratada.nome.trim()||"NovaesWeb",contratadaCaption:(s=e.contratada.representante)!=null&&s.trim()?`Representada por ${e.contratada.representante.trim()}`:"Parte contratada",note:a!=null&&a.signedAt?"Assinatura eletrônica simples confirmada com nome do responsável no portal do cliente.":"Espaço visual preparado para aceite final e impressão da proposta."}}function pe(e){var d,s;const a=((d=A(e.items))==null?void 0:d.name)||"sem plano principal",t=$(e),o=t.length?`${t.length} extra(s) adicional(is)`:"nenhum extra adicional",n=e.primaryPlanId==="sob-medida"&&e.customScope.trim()?` O escopo customizado desta proposta é: ${e.customScope.trim()}.`:"";return(s=e.valorRevisao)!=null&&s.trim()&&`${e.valorRevisao.trim()}`,[{number:"1",title:"O que está sendo contratado",explanation:`Este contrato cobre a estrutura digital contratada dentro do ecossistema NovaesWeb, podendo abranger site institucional, landing page, sistema interno, painel administrativo, gestão de pedidos, automação de atendimento via WhatsApp, marketing digital, manutenção recorrente, módulos adicionais, integrações e extras, conforme detalhado nas condições comerciais. Nesta venda, o plano principal é ${a} e foram incluídos ${o}.${n}`},{number:"2",title:"Escopo e exclusões",explanation:"Tudo o que está descrito no resumo comercial faz parte da entrega. O que estiver fora do escopo, nas exclusões ou não estiver aprovado na proposta pode ser tratado como adicional e cobrado à parte. O cliente precisa enviar logo, textos, fotos, acessos e demais materiais necessários. Se isso atrasar, o prazo do projeto também pode atrasar."},{number:"3",title:"Materiais e briefing",explanation:"O CONTRATANTE deverá fornecer todos os materiais e informações necessários. O atraso no envio suspende automaticamente a contagem dos prazos. A CONTRATADA não se responsabiliza por atrasos decorrentes de material incompleto ou enviado fora do prazo."},{number:"4",title:"Prazos e execução",explanation:`Prazo estimado de ${e.prazoDias} dias úteis. O prazo começa quando briefing, materiais e pagamento inicial estiverem em ordem. Havendo paralisação por mais de 15 dias, a CONTRATADA poderá reprogramar a fila de produção.`},{number:"5",title:"Valores e pagamento",explanation:`O CONTRATANTE pagará à CONTRATADA os valores definidos nas condições comerciais. A forma de pagamento é: ${e.formaPagamento}. O início da execução poderá ficar condicionado à compensação da entrada. Custos com licenças, ferramentas de terceiros, domínio, hospedagem, disparos, mídia paga e serviços não inclusos no escopo serão cobrados separadamente.`},{number:"6",title:"Atrasos e inadimplência",explanation:"Em caso de atraso no pagamento, a CONTRATADA poderá suspender serviços, atendimento, manutenção, publicações, automações, entregas e liberações até a regularização. Se houver saldo em aberto durante projeto, a execução poderá ser congelada até quitação integral."},{number:"7",title:"Revisões e alterações",explanation:`Estão incluídas até ${e.numeroRevisoes} rodadas de revisão dentro do escopo aprovado. Revisões, refações, alterações estruturais, mudanças de direção ou novos pedidos fora do escopo poderão ser cobrados adicionalmente no valor mínimo de R$ ${e.valorRevisao} por demanda.`},{number:"8",title:"Propriedade intelectual",explanation:"Até a quitação integral, a estrutura, arquivos editáveis, painel, páginas, sistemas, automações, layouts, códigos e ativos digitais permanecem sob titularidade da CONTRATADA. A cessão definitiva ocorre somente após pagamento total."},{number:"9",title:"Marketing e resultados",explanation:"Quando houver marketing, conteúdo, automações ou processos comerciais, a CONTRATADA atua com base técnica e estratégica, mas não garante resultado absoluto de vendas, leads ou faturamento, pois isso depende de variáveis externas e da operação do CONTRATANTE."},{number:"10",title:"Suporte e manutenção",explanation:`Serviços de suporte, manutenção, acompanhamento ou operação recorrente só valem se contratados expressamente. Quando existentes, serão prestados dentro da janela: ${e.prazoSuporte}. Não se incluem automaticamente: criação de novas páginas, novos módulos, mudanças profundas de layout, integrações não previstas ou demandas fora do escopo.`},{number:"11",title:"Cancelamento e rescisão",explanation:"O CONTRATANTE pode cancelar mesmo após início dos trabalhos, mas valores já pagos para ativação e estruturação não serão devolvidos. Em caso de cancelamento, a estrutura permanece ativa apenas até o período já pago. Em descumprimento grave, inadimplência reiterada ou uso indevido, a CONTRATADA poderá rescindir imediatamente."},{number:"12",title:"Sigilo e dados",explanation:"As partes mantêm sigilo sobre informações estratégicas, comerciais, operacionais, dados e documentos. Os dados serão utilizados apenas para execução do serviço, atendimento, suporte e obrigações correlatas. O CONTRATANTE é responsável pela veracidade das informações fornecidas."},{number:"13",title:"Observações comerciais",explanation:e.observacoesComerciais.trim()||"As partes reconhecem as observações comerciais como parte integrante do contrato."},{number:"14",title:"Foro e jurisdição",explanation:"Fica eleito o foro da Comarca de Canoas/RS, com renúncia expressa a qualquer outro, por mais privilegiado que seja."}]}function Le(e,a,t,o){const n=m(e),d=m(re(a)).replace(/\n/g,"<br />"),s=t?me(t):null,l=t?pe(t):[],r=ue(t,o),p=i=>`
    <td class="info-card">
      <div class="info-kicker">${m(i.eyebrow)}</div>
      <div class="info-title">${m(i.title)}</div>
      <div class="info-lines">
        ${i.lines.map(b=>`<div>${m(b)}</div>`).join("")}
      </div>
    </td>
  `,g=(i,b=!1)=>`
    <div class="${b?"service-card service-card-featured":"service-card"}">
      ${i.highlight?`<div class="service-tag">${m(i.highlight)}</div>`:""}
      <div class="service-name">${m(i.name)}</div>
      <div class="service-pricing">${m(i.pricing)}</div>
      ${i.description?`<div class="service-description">${m(i.description)}</div>`:""}
    </div>
  `,x=i=>`
    <div class="explanation-card">
      <div class="explanation-kicker">Cláusula ${m(i.number)}</div>
      <div class="explanation-title">${m(i.title)}</div>
      <div class="explanation-copy">${m(i.explanation)}</div>
    </div>
  `;return`<!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${n}</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #16121f;
          margin: 0;
          background: #f7f4fb;
        }
        .sheet {
          padding: 34px 34px 48px;
        }
        .hero {
          background: linear-gradient(135deg, #261135, #5d1f7a 48%, #e8334a 100%);
          color: white;
          padding: 24px 26px;
          border-radius: 24px;
          box-shadow: 0 18px 40px rgba(35, 11, 44, 0.18);
        }
        .hero-kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          opacity: 0.72;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
        }
        .hero-copy {
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.7;
          max-width: 640px;
          color: rgba(255,255,255,0.84);
        }
        .summary-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 14px;
          margin-top: 20px;
        }
        .info-card {
          width: 33.33%;
          vertical-align: top;
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px 18px 16px;
        }
        .info-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7f668f;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .info-title {
          font-size: 17px;
          font-weight: 700;
          color: #1b1323;
          margin-bottom: 10px;
        }
        .info-lines {
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .section-title {
          margin: 26px 0 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #8d3cb0;
          font-weight: 800;
        }
        .service-card {
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px 18px 16px;
          margin-bottom: 12px;
        }
        .service-card-featured {
          background: linear-gradient(180deg, #fff, #fff7fb);
          border-color: #e6b9d4;
        }
        .service-tag {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7f668f;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .service-name {
          font-size: 16px;
          font-weight: 800;
          color: #1b1323;
        }
        .service-pricing {
          margin-top: 6px;
          font-size: 13px;
          color: #a32161;
          font-weight: 700;
        }
        .service-description {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .scope-box {
          margin-top: 12px;
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px;
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .explanation-card {
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 20px;
          padding: 18px;
          margin-bottom: 12px;
        }
        .explanation-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7f668f;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .explanation-title {
          font-size: 15px;
          font-weight: 800;
          color: #1b1323;
          margin-bottom: 8px;
        }
        .explanation-copy {
          font-size: 12px;
          line-height: 1.7;
          color: #54495d;
        }
        .copy {
          margin-top: 26px;
          background: #ffffff;
          border: 1px solid #ecdff4;
          border-radius: 24px;
          padding: 26px;
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: 12px;
        }
        .signature-section {
          margin-top: 24px;
          padding: 26px 24px;
          border-radius: 28px;
          background:
            radial-gradient(circle at top left, rgba(123,31,162,0.14), transparent 34%),
            radial-gradient(circle at top right, rgba(232,51,74,0.12), transparent 36%),
            linear-gradient(135deg, rgba(123,31,162,0.12), rgba(232,51,74,0.08), rgba(194,24,91,0.14));
          border: 1px solid #ecdff4;
          text-align: center;
        }
        .signature-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #8d3cb0;
          font-weight: 800;
        }
        .signature-date {
          margin-top: 8px;
          font-size: 12px;
          color: #6f5b7d;
        }
        .signature-grid {
          width: 100%;
          border-collapse: separate;
          border-spacing: 14px 0;
          margin-top: 18px;
        }
        .signature-card {
          width: 50%;
          background: rgba(255,255,255,0.9);
          border: 1px solid #ecdff4;
          border-radius: 22px;
          padding: 16px 16px 18px;
          vertical-align: top;
          box-shadow: 0 18px 36px rgba(33, 18, 49, 0.08);
        }
        .signature-role {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #8b7998;
          font-weight: 800;
        }
        .signature-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #7b1fa2, #e8334a, #c2185b);
          margin: 14px 0 12px;
        }
        .signature-name {
          font-size: 16px;
          font-weight: 800;
          color: #1b1323;
        }
        .signature-caption {
          margin-top: 6px;
          font-size: 11px;
          color: #6d5f77;
        }
        .signature-note {
          margin-top: 14px;
          font-size: 11px;
          color: #6d5f77;
        }
        .footer {
          margin-top: 40px;
          padding-top: 18px;
          border-top: 2px solid #f0d8ea;
          font-size: 11px;
          color: #6d5f77;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="hero">
          <div class="hero-kicker">NovaesWeb • Proposta comercial premium</div>
          <div class="title">${n}</div>
          <div class="hero-copy">Documento comercial gerado no montador da NovaesWeb, com escopo selecionado, condições financeiras e cláusulas contratuais organizadas para negociação e fechamento.</div>
        </div>
        ${s?`
        <table class="summary-table">
          <tr>
            ${p(s.contractante)}
            ${p(s.contratada)}
            ${p(s.comercial)}
          </tr>
        </table>
        <div class="section-title">Plano e serviços contratados</div>
        ${s.selectedPlan?g(s.selectedPlan,!0):""}
        ${s.customScope?`<div class="scope-box"><strong>Escopo customizado</strong><br />${m(s.customScope)}</div>`:""}
        ${s.selectedServices.map(i=>g(i)).join("")}
        `:""}
        ${l.length?`
        <div class="section-title">Contrato explicado em linguagem simples</div>
        ${l.map(i=>x(i)).join("")}
        `:""}
        <div class="copy">${d}</div>
        ${r?`
        <div class="signature-section">
          <div class="signature-kicker">Aceite e assinatura</div>
          <div class="signature-date">${m(r.locationAndDate)}</div>
          <table class="signature-grid">
            <tr>
              <td class="signature-card">
                <div class="signature-role">Contratante</div>
                <div class="signature-line"></div>
                <div class="signature-name">${m(r.contractanteName)}</div>
                <div class="signature-caption">${m(r.contractanteCaption)}</div>
              </td>
              <td class="signature-card">
                <div class="signature-role">Contratada</div>
                <div class="signature-line"></div>
                <div class="signature-name">${m(r.contratadaName)}</div>
                <div class="signature-caption">${m(r.contratadaCaption)}</div>
              </td>
            </tr>
          </table>
          <div class="signature-note">${m(r.note)}</div>
        </div>
        `:""}
        <div class="footer">NovaesWeb • Estrutura digital premium • Documento gerado no painel administrativo</div>
      </div>
    </body>
  </html>`}const Ie=["rascunho","enviado","visualizado","assinado","cancelado"],ge={rascunho:"Rascunho",enviado:"Enviado",visualizado:"Visualizado",assinado:"Assinado",cancelado:"Cancelado"},fe={rascunho:"border-violet-300/20 bg-violet-300/10 text-violet-200",enviado:"border-emerald-300/20 bg-emerald-300/10 text-emerald-200",visualizado:"border-rose-300/20 bg-rose-300/10 text-rose-200",assinado:"border-green-300/20 bg-green-300/10 text-green-200",cancelado:"border-red-300/20 bg-red-300/10 text-red-200"};function xe(e){return ge[e]||e}function Me(e){return fe[e]||"border-white/10 bg-white/5 text-white/70"}function E(e){return e?w(new Date(e),{addSuffix:!0,locale:N}):null}function Be({status:e,dataEnvio:a,dataVisualizacao:t,dataAssinatura:o,onboardingStartedAt:n,pedidoId:d,requiresResign:s,resignReason:l}){if(s)return{title:"Assinatura pendente por atualização",subtitle:l||"Assinatura pendente por atualização de extra e melhoria do sistema."};if(e==="enviado"){const r=E(a);return{title:r?`Enviado ${r}`:"Enviado aguardando leitura",subtitle:"O cliente já recebeu o contrato no portal, mas ainda não abriu."}}if(e==="visualizado"){const r=E(t);return{title:r?`Visualizado ${r}`:"Visualizado aguardando assinatura",subtitle:"Bom momento para follow-up comercial e fechamento."}}if(e==="assinado"){const r=E(o);return n||d?{title:r?`Assinado ${r}`:"Assinado",subtitle:d?"Onboarding iniciado e pedido operacional criado automaticamente.":"Onboarding já foi iniciado para este contrato."}:{title:r?`Assinado ${r}`:"Assinado",subtitle:"Contrato fechado. Falta iniciar o onboarding operacional."}}return e==="rascunho"?{title:"Rascunho em preparação",subtitle:"A proposta ainda não foi enviada para o cliente."}:e==="cancelado"?{title:"Contrato cancelado",subtitle:"Este fluxo não está mais ativo no pipeline comercial."}:{title:xe(e),subtitle:"Acompanhe a timeline para ver os próximos movimentos do contrato."}}export{Ie as C,_e as a,Re as b,ce as c,Se as d,$e as e,Te as f,ke as g,$ as h,me as i,xe as j,Me as k,Be as l,u as m,R as n,pe as o,Oe as p,ue as q,Ne as r,je as s,Ee as t,Pe as u,ze as v,De as w,re as x,Le as y,we as z};
