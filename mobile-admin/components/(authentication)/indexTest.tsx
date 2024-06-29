import { graphql, useLazyLoadQuery } from "react-relay";
import { DynamicText } from "..";
import { indexTestQuery } from "./__generated__/indexTestQuery.graphql";

const indexTestQueryGraphQL = graphql`
  query indexTestQuery {
    test
  }
`;

interface ResultProps {
  fetchKey: number;
}

const Result = ({ fetchKey }: ResultProps) => {
  const { test } = useLazyLoadQuery<indexTestQuery>(
    indexTestQueryGraphQL,
    {},
    { fetchKey }
  );

  return <DynamicText>{test}</DynamicText>;
};

export default Result;
