import { graphql, useLazyLoadQuery } from "react-relay";
import { DynamicText, DynamicView } from "..";
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

  return (
    <DynamicView flex={1} variant="centerItems">
      <DynamicText>{test}!!Phil!!hehe</DynamicText>
    </DynamicView>
  );
};

export default Result;
