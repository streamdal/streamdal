/*
Copyright 2024.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// StreamdalConfigSpec defines the desired state of StreamdalConfig
type StreamdalConfigSpec struct {
	// +kubebuilder:validation:Required
	ServerAddress string `json:"serverAddress"`

	// +kubebuilder:validation:Required
	ServerAuth string `json:"serverAuth"`

	Configs []ConfigItem `json:"configs,omitempty"`
}

type ConfigItem struct {
	// +kubebuilder:validation:Required
	Name string `json:"name,omitempty"`

	// +kubebuilder:validation:Required
	Config string `json:"config,omitempty"`
}

// StreamdalConfigStatus defines the observed state of StreamdalConfig
type StreamdalConfigStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	Fatal   bool   `json:"fatal"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// StreamdalConfig is the Schema for the streamdalconfigs API
type StreamdalConfig struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   StreamdalConfigSpec   `json:"spec,omitempty"`
	Status StreamdalConfigStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// StreamdalConfigList contains a list of StreamdalConfig
type StreamdalConfigList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []StreamdalConfig `json:"items"`
}

func init() {
	SchemeBuilder.Register(&StreamdalConfig{}, &StreamdalConfigList{})
}
