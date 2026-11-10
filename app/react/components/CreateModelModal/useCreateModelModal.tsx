import React, { useContext } from "react";
import { ModalsContext } from "../../containers/Modals";
import CreateModelModal, { CreateModelResult } from "./CreateModelModal";
import { Model } from "@services/types/model";

interface CreateModelModalOptions {
	cancelable?: boolean;
}

export function useCreateModelModal(models: Model[]) {
	const context = useContext(ModalsContext);
	if (!context) {
		throw new Error("useCreateModelModal must be used within a ModalsProvider");
	}
	return {
		open: (options: CreateModelModalOptions = {}) =>
			context.open<CreateModelResult>(({ onSuccess, onCancel, onError }) => (
				<CreateModelModal
					models={models}
					open
					cancelable={options.cancelable ?? true}
					onSuccess={onSuccess}
					onCancel={onCancel}
					onError={onError}
				/>
			)),
	};
}
