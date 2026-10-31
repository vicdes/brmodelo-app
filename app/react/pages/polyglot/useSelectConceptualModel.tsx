import { Model } from "@services/types/model";
import { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import SelectConceptualModel from "./SelectConceptualModel";

export function useSelectConceptualModelModal(models: Model[]) {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error(
			"useSelectConceptualModelModal must be used within a ModalsProvider",
		);
	}
	return {
		open: () =>
			context.open<Model>(({onSuccess, onCancel}) => (
				<SelectConceptualModel open models={models} onSuccess={onSuccess} onCancel={onCancel}  />
			)),
	};
}
