/**
 * Dados estruturados (schema.org).
 *
 * A academia é descrita como `ExerciseGym`/`HealthAndBeautyBusiness` com
 * `LocalBusiness` no tipo — é o que o Google entende para negócio local com
 * endereço físico.
 *
 * A nota agregada e os horários vêm dos mesmos arquivos que alimentam a
 * página: nada é declarado só para o buscador. Horário só entra no schema
 * quando estiver confirmado em data/businessHours.ts.
 */
import { academy, enderecoCompleto, links } from '@/data/academy';
import { horariosSchema } from '@/data/businessHours';
import { perguntas } from '@/data/faq';

export function schemaAcademia() {
  const horarios = horariosSchema();

  return {
    '@context': 'https://schema.org',
    '@type': ['ExerciseGym', 'LocalBusiness'],
    '@id': `${academy.urlCanonica}/#academia`,
    name: academy.nomeCompleto,
    alternateName: academy.nome,
    description:
      'Academia no Centro de Londrina com musculação, área de cardio, aulas coletivas e spinning, em salão amplo e climatizado.',
    url: academy.urlCanonica,
    telephone: `+${academy.telefone.e164}`,
    image: `${academy.urlCanonica}/og.png`,
    logo: `${academy.urlCanonica}/icon.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: academy.endereco.rua,
      addressLocality: academy.endereco.cidade,
      addressRegion: academy.endereco.estado,
      postalCode: academy.endereco.cep,
      addressCountry: 'BR',
    },
    areaServed: { '@type': 'City', name: academy.endereco.cidade },
    hasMap: links.perfilMaps,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: academy.avaliacao.nota,
      reviewCount: academy.avaliacao.quantidade,
      bestRating: 5,
      worstRating: 1,
    },
    ...(horarios.length > 0 ? { openingHours: horarios } : {}),
    amenityFeature: [
      'Musculação',
      'Área de cardio',
      'Aulas coletivas',
      'Ambiente climatizado',
      'Estacionamento',
    ].map((nome) => ({ '@type': 'LocationFeatureSpecification', name: nome, value: true })),
    knowsLanguage: 'pt-BR',
    slogan: 'Treine em outro nível.',
    keywords: `academia em ${academy.endereco.cidade}, musculação, cardio, aulas coletivas`,
    sameAs: [academy.site, ...Object.values(academy.redes).filter(Boolean)] as string[],
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Endereço completo', value: enderecoCompleto },
    ],
  };
}

/** Mesmo conteúdo do acordeão — sem pergunta que não esteja na página. */
export function schemaPerguntas() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  };
}
